import Image from 'next/image'

type WebtokokuLogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
  showText?: boolean
}

export function WebtokokuLogo({
  className,
  markClassName,
  textClassName,
  showText = true,
}: WebtokokuLogoProps) {
  return (
    <span className={className}>
      <Image
        src="/brand/webtokoku-logo.svg"
        alt=""
        width={28}
        height={28}
        className={markClassName}
        priority
      />
      {showText && <span className={textClassName}>webtokoku</span>}
    </span>
  )
}
