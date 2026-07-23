import { motion } from "framer-motion";
import Button from "../Common/Button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/consultation");
  }
  return (
    <div className="bg-white text-gray-900">
      <section className="min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4"
            >
              Premium Interior Design
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-6xl font-bold leading-tight"
            >
              Transform Your
              <span className="block text-[#C9A227]">
                Dream Space
              </span>
              With Velora
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-lg text-gray-600 leading-8 max-w-xl"
            >
              We craft luxurious interiors, elegant furniture, and timeless
              living spaces that perfectly blend comfort with sophistication.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col gap-5 mt-10 sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-[#C9A227] text-white px-8 py-4 rounded-lg font-semibold hover:bg-yellow-700 transition w-full sm:w-auto">
                  Explore Projects
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleClick} className="border-2 border-[#C9A227] bg-transparent text-[#C9A227] px-8 py-4 rounded-lg font-semibold hover:bg-[#c29604] hover:text-white transition w-full sm:w-auto">
                  Book Consultation
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex gap-14 mt-14"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <h2 className="text-3xl font-bold text-[#C9A227]">150+</h2>
                <p className="text-gray-500">Completed Projects</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-[#C9A227]">200+</h2>
                <p className="text-gray-500">Satisfied Clients</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-[#C9A227]">8+</h2>
                <p className="text-gray-500">Years Experience</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="h-[650px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <motion.img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200"
                alt="Luxury Interior"
                className="w-full h-full object-cover"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-8 -left-10 bg-white shadow-xl rounded-xl p-6"
            >
              <h3 className="text-[#C9A227] font-bold text-2xl">Velora</h3>
              <p className="text-gray-500">
                Luxury Furniture & Interior Studio
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Hero;