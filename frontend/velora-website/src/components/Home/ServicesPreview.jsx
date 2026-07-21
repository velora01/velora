import {
    Sofa,
    BedDouble,
    CookingPot,
    Building2,
    ArrowRight,
    LampFloor,
} from "lucide-react";


import { motion } from "framer-motion";

const services = [
    {
        title: "Living Room",
        image:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
        icon: Sofa,
        desc: "Elegant furniture and modern living spaces.",
    },
    {
        title: "Bedroom",
        image:
            "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
        icon: BedDouble,
        desc: "Luxury bedrooms designed for comfort.",
    },
    {
        title: "Modular Kitchen",
        image:
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
        icon: CookingPot,
        desc: "Functional kitchens with premium finishes.",
    },
    {
        title: "Office Interior",
        image:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
        icon: Building2,
        desc: "Smart workspaces for modern businesses.",
    },
    {
        title: "Lighting Design",
        image:
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
        icon: LampFloor,
        desc: "Beautiful lighting that enhances every room.",
    },
    {
        title: "Custom Furniture",
        image:
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
        icon: Sofa,
        desc: "Made-to-order furniture crafted with precision.",
    },
];

const ServicesPreview = () => {
    return (
        <motion.section
            className="py-24 bg-[#faf8f4]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
        >
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-16">
                    <p className="uppercase tracking-[4px] text-[#C9A227] font-semibold">
                        Our Expertise
                    </p>

                    <h2 className="text-5xl font-bold mt-4">
                        Interior Solutions For Every Space
                    </h2>

                    <p className="mt-6 text-gray-500 max-w-2xl mx-auto">
                        From concept to completion, Velora delivers beautifully crafted
                        interiors with premium materials and exceptional attention to
                        detail.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.7, delay: index * 0.12 }}
                                whileHover={{ y: -10 }}
                                className="group relative h-[430px] rounded-3xl overflow-hidden shadow-xl cursor-pointer"
                            >
                                <motion.img
                                    src={service.image}
                                    alt={service.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.7 }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                                <div className="absolute top-6 left-6 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30">
                                    <Icon size={28} className="text-white" />
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <h3 className="text-3xl font-bold">
                                        {service.title}
                                    </h3>

                                    <p className="mt-3 text-gray-200">
                                        {service.desc}
                                    </p>

                                    <motion.button
                                        whileHover={{ x: 8 }}
                                        className="mt-6 flex items-center gap-2 text-[#D4AF37] font-semibold"
                                    >
                                        Explore
                                        <ArrowRight size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
};

export default ServicesPreview;