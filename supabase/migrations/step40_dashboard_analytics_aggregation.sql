-- STEP 40: Accurate seller dashboard analytics without PostgREST's 1,000-row cap.

create or replace function public.get_store_dashboard_analytics(target_store_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_id uuid := auth.uid();
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not (
    public.is_platform_admin(caller_id)
    or exists (
      select 1
      from public.stores st
      join public.sellers se on se.id = st.seller_id
      where st.id = target_store_id
        and se.user_id = caller_id
    )
  ) then
    raise exception 'Access denied';
  end if;

  with traffic_summary as (
    select
      count(*)::bigint as total_views,
      count(distinct visitor_id)::bigint as unique_visitors
    from public.store_traffic
    where store_id = target_store_id
      and created_at >= now() - interval '30 days'
  ),
  order_summary as (
    select
      coalesce(sum(total) filter (where order_status = 'selesai'), 0)::numeric as completed_revenue,
      count(*) filter (
        where order_status in ('menunggu_pembayaran', 'menunggu_konfirmasi')
      )::bigint as pending_confirmation,
      count(*) filter (where order_status <> 'dibatalkan')::bigint as active_orders
    from public.orders
    where store_id = target_store_id
  ),
  days as (
    select generate_series(
      date_trunc('day', now() at time zone 'Asia/Jakarta') - interval '6 days',
      date_trunc('day', now() at time zone 'Asia/Jakarta'),
      interval '1 day'
    ) as local_day
  ),
  daily as (
    select
      to_char(days.local_day, 'YYYY-MM-DD') as date,
      (
        select count(*)::bigint
        from public.store_traffic traffic
        where traffic.store_id = target_store_id
          and traffic.created_at >= days.local_day at time zone 'Asia/Jakarta'
          and traffic.created_at < (days.local_day + interval '1 day') at time zone 'Asia/Jakarta'
      ) as views,
      (
        select coalesce(sum(orders.total), 0)::numeric
        from public.orders orders
        where orders.store_id = target_store_id
          and orders.order_status = 'selesai'
          and orders.created_at >= days.local_day at time zone 'Asia/Jakarta'
          and orders.created_at < (days.local_day + interval '1 day') at time zone 'Asia/Jakarta'
      ) as sales
    from days
    order by days.local_day
  )
  select jsonb_build_object(
    'totalViews', traffic_summary.total_views,
    'uniqueVisitors', traffic_summary.unique_visitors,
    'completedRevenue', order_summary.completed_revenue,
    'pendingConfirmation', order_summary.pending_confirmation,
    'activeOrders', order_summary.active_orders,
    'dailyTrend', coalesce(
      (select jsonb_agg(jsonb_build_object('date', date, 'views', views, 'sales', sales)) from daily),
      '[]'::jsonb
    )
  )
  into result
  from traffic_summary
  cross join order_summary;

  return result;
end;
$$;

revoke all on function public.get_store_dashboard_analytics(uuid) from public;
revoke all on function public.get_store_dashboard_analytics(uuid) from anon;
grant execute on function public.get_store_dashboard_analytics(uuid) to authenticated;

