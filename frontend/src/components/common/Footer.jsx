import footer from "../../assets/footer.png"

export default function Footer() {
  return (
    <footer
      className="relative bg-gradient-to-b from-[#B91C1C] to-[#E02929] text-white text-center py-12 px-4 overflow-hidden"
      style={{ backgroundImage: `url(${footer})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}
    >
      <h2 className="text-3xl font-bold mb-2">Ready to Cook Something Amazing?</h2>
      <p className="mb-6 text-lg">Discover thousands of recipes from across Asia</p>
      <button 
      onClick={() => window.location.href = '/resep'}
      className="bg-white text-red-600 font-semibold py-2 px-6 rounded-full shadow hover:bg-gray-100 transition"
      >
        Explore All Recipes
      </button>
      <div className="flex justify-center gap-6 mt-6">
        <a href="#"><i className="fab fa-facebook-f text-xl"></i></a>
        <a href="#"><i className="fab fa-instagram text-xl"></i></a>
        <a href="#"><i className="fab fa-youtube text-xl"></i></a>
      </div>
      <p className="mt-8 text-sm text-white/80">© 2025 We’re Cooked. All rights reserved.</p>
    </footer>
  );
}
