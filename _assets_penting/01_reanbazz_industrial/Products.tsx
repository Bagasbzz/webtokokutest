"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const products = [
  { id: 1, name: "Excavator", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Excavator_Postiguet_Beach_2.jpg/960px-Excavator_Postiguet_Beach_2.jpg" },
  { id: 2, name: "Wheel Loader", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Front_end_loader_2.jpg/960px-Front_end_loader_2.jpg" },
  { id: 3, name: "Road Cold Recycler", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Ford_8N.jpg/960px-Ford_8N.jpg" },
  { id: 4, name: "Asphalt Paver", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/AF-asphalt-laying-machine.jpg/960px-AF-asphalt-laying-machine.jpg" },
  { id: 5, name: "Roller", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/John_Deere_roller%2C_U.S._Navy%2C_Camp_Covington%2C_NMCB-133%2C_080928-N-1106H-001.jpg/960px-John_Deere_roller%2C_U.S._Navy%2C_Camp_Covington%2C_NMCB-133%2C_080928-N-1106H-001.jpg" },
  { id: 6, name: "Motor Grader", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Grader_2.jpg/960px-Grader_2.jpg" },
];

export default function Products() {
  return (
    <section id="products" className="py-16 md:py-24 bg-darker">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12"
        >
          <h2 className="!mb-0">High Quality Heavy Equipment</h2>
          <a href="#" className="btn btn-outline shrink-0">All Product</a>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-card border border-border hover:border-primary overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="relative h-[250px] overflow-hidden bg-black">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-4">{product.name}</h3>
                <a href="#" className="inline-flex items-center gap-1 text-primary font-semibold text-sm uppercase group-hover:gap-2 transition-all">
                  View Details <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
