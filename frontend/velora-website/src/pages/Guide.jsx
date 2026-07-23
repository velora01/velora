import { useState } from "react";
import {
  BedDouble,
  ChefHat,
  Sofa,
  Bath,
  Home,
  LampDesk,
} from "lucide-react";

const categories = [
  {
    id: "bedroom",
    name: "Bedroom",
    icon: BedDouble,
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: ChefHat,
  },
  {
    id: "living",
    name: "Living Room",
    icon: Sofa,
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: Bath,
  },
  {
    id: "pooja",
    name: "Pooja Room",
    icon: Home,
  },
  {
    id: "office",
    name: "Home Office",
    icon: LampDesk,
  },
];

const guides = {
  bedroom: [
    {
      title: "15 Modern Bedroom Ideas",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
    },
    {
      title: "Luxury Master Bedroom",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=901",
    },
    {
      title: "Wardrobe Design Guide",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=902",
    },
    {
      title: "Minimal Bedroom Decor",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=903",
    },
  ],

  kitchen: [
    {
      title: "Modular Kitchen Designs",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=900",
    },
    {
      title: "Parallel Kitchen Guide",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=901",
    },
    {
      title: "Island Kitchen Ideas",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=902",
    },
    {
      title: "Kitchen Storage Hacks",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=903",
    },
  ],

  living: [
    {
      title: "Luxury Living Room",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=910",
    },
    {
      title: "TV Unit Designs",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=911",
    },
    {
      title: "Sofa Placement Guide",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=912",
    },
    {
      title: "Modern Hall Interior",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=913",
    },
  ],

  bathroom: [
    {
      title: "Luxury Bathroom Designs",
      image:
        "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=900",
    },
    {
      title: "Small Bathroom Ideas",
      image:
        "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=901",
    },
    {
      title: "Vanity Design Guide",
      image:
        "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=902",
    },
    {
      title: "Bathroom Storage",
      image:
        "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=903",
    },
  ],

  pooja: [
    {
      title: "Modern Pooja Unit",
      image:
        "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=900",
    },
    {
      title: "Temple Design Ideas",
      image:
        "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=901",
    },
  ],

  office: [
    {
      title: "Home Office Setup",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900",
    },
    {
      title: "Work From Home Interior",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=901",
    },
  ],
};

export default function Guide() {
  const [active, setActive] = useState("bedroom");

  return (
    <section className="py-20 bg-gray-50">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-14">
          <p className="text-amber-600 font-semibold">
            DESIGN GUIDES
          </p>

          <h2 className="text-4xl font-bold mt-2">
            Explore Interior Design Ideas
          </h2>

          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Browse hundreds of professionally curated room inspirations,
            layouts, storage ideas and decorating guides.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap justify-center mb-14">
          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all

                ${
                  active === item.id
                    ? "bg-amber-500 text-white shadow-xl"
                    : "bg-white border hover:border-amber-500"
                }
                `}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {guides[active].map((guide, index) => (

            <div
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500"
            >

              <div className="overflow-hidden">

                <img
                  src={guide.image}
                  alt=""
                  className="h-72 w-full object-cover group-hover:scale-110 transition duration-700"
                />

              </div>

              <div className="p-6">

                <h3 className="text-xl font-semibold mb-3">
                  {guide.title}
                </h3>

                <button className="text-amber-600 font-semibold">
                  Explore →
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}