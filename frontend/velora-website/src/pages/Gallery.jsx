import React, { useState } from "react";

const galleryData = [
  {
    id: 1,
    title: "Modern Living Room",
    category: "Living Room",
    style: "Modern",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  },
  {
    id: 2,
    title: "Luxury Bedroom",
    category: "Bedroom",
    style: "Luxury",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format",
  },
  {
    id: 3,
    title: "Modular Kitchen",
    category: "Kitchen",
    style: "Minimal",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
  },
  {
    id: 4,
    title: "Premium Bathroom",
    category: "Bathroom",
    style: "Luxury",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200",
  },
  {
    id: 5,
    title: "Luxury Sofa Collection",
    category: "Furniture",
    style: "Modern",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200",
  },
  {
    id: 6,
    title: "Dining Area",
    category: "Dining",
    style: "Contemporary",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
  },
  {
    id: 7,
    title: "TV Unit Design",
    category: "TV Unit",
    style: "Wooden",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  },
  {
    id: 8,
    title: "Wardrobe Design",
    category: "Wardrobe",
    style: "Luxury",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  },
  {
    id: 9,
    title: "Office Interior",
    category: "Office",
    style: "Minimal",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
  },
  {
    id: 10,
    title: "Kids Bedroom",
    category: "Kids Room",
    style: "Modern",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  },
  {
    id: 11,
    title: "Balcony Design",
    category: "Balcony",
    style: "Nature",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
  },
  {
    id: 12,
    title: "Luxury Hall",
    category: "Hall",
    style: "Premium",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  },
];

const filters = [
  "All",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Furniture",
  "Dining",
  "TV Unit",
  "Wardrobe",
  "Office",
  "Kids Room",
  "Balcony",
  "Hall",
];

export default function Gallery() {

  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = galleryData.filter((item) => {
    const matchCategory =
      active === "All" || item.category === active;
      
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;

  });

  return (
    <section className="bg-gray-50 py-20">

      <div className="max-w-7xl mx-auto px-5">

        <div className="text-center mb-14">

          <h2 className="text-5xl font-bold text-gray-900">
            Design Gallery
          </h2>

          <p className="text-gray-500 mt-5 max-w-2xl mx-auto leading-8">
            Discover beautifully crafted interiors, premium furniture,
            modular kitchens, luxurious bedrooms, living rooms,
            wardrobes and more designed for modern homes.
          </p>

        </div>

        {/* Search */}

        <div className="flex justify-center mb-8">

          <input
            type="text"
            placeholder="Search Design..."
            className="w-full max-w-lg rounded-full border border-gray-300 px-6 py-4 outline-none focus:ring-2 focus:ring-yellow-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Filters */}

        <div className="flex flex-wrap justify-center gap-3 mb-14">

          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-5 py-2 rounded-full transition-all duration-300 ${
                active === item
                  ? "bg-yellow-500 text-white shadow-lg"
                  : "bg-white hover:bg-yellow-100 border"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        {/* Gallery */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filtered.map((item) => (

            <div
              key={item.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-500"
            >

              <div className="overflow-hidden relative">

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute top-4 left-4">

                  <span className="bg-yellow-500 text-white text-xs px-4 py-1 rounded-full">
                    {item.category}
                  </span>

                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">

                  <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 hover:text-white transition">
                    View Design
                  </button>

                </div>

              </div>

              <div className="p-6">

                <h3 className="text-xl font-bold text-gray-800">
                  {item.title}
                </h3>

                <div className="flex justify-between mt-4 text-gray-500">

                  <span>{item.style}</span>

                  <span>Premium</span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}