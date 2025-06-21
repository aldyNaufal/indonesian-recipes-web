import React from 'react';
import { Users, Lightbulb, Target, Heart } from 'lucide-react';
import radith from "../../assets/radith.png";
import supip from "../../assets/supip.png";
import me from "../../assets/me.png";
import farid from "../../assets/farid.png";
import ali from "../../assets/ali.png";
import haikal from "../../assets/haikal.png";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Radithya Fawwaz Aydin",
      role: "Machine Learning Engineer",
      university: "Universitas Brawijaya",
      image: radith,
      description: "Specializes in recommendation algorithms and food data analysis"
    },
    {
      name: "Sulthan Muhammad Rafif Ilham",
      role: "Machine Learning Engineer", 
      university: "Universitas Brawijaya",
      image: supip,
      description: "Expert in neural networks and ingredient recognition systems"
    },
    {
      name: "Muhammad Aldy Naufal Fadhilah",
      role: "Machine Learning Engineer",
      university: "Universitas Brawijaya",
      image: me,
      description: "Creates intuitive user interfaces with React.js and modern design"
    },
    {
      name: "Muhammad Farid Jazir Fadhlurrahman",
      role: "Backend Developer",
      university: "Universitas Islam Makassar",
      image: farid,
      description: "Builds robust APIs and manages database architecture"
    },
    {
      name: "Ali Tawfiqur Rahman",
      role: "Frontend Developer",
      university: "IAI AI Muhammad Cepu",
      image: ali,
      description: "Focuses on responsive design and user experience optimization"
    },
    {
      name: "Haikal Fawwaz Karim",
      role: "Frontend Developer",
      university: "Universitas Teknologi Yogyakarta",
      image: haikal,
      description: "Develops scalable server infrastructure and data processing pipelines"
    }
  ];

  const backgroundFacts = [
  {
    icon: <Target className="w-8 h-8 text-blue-600" />,
    title: "Pola Pikir Konvensional",
    description: "Pendekatan konvensional dalam memasak biasanya dimulai dengan memilih resep terlebih dahulu, lalu membeli bahan-bahan yang dibutuhkan untuk resep tersebut.",
    label: "Cara Lama"
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-orange-600" />,
    title: "Ketidakefisienan Praktis",
    description: "Pola 'resep duluan' ini bisa tidak efisien karena tidak memanfaatkan bahan yang sudah tersedia, sehingga meningkatkan potensi pemborosan makanan."
  },
  {
    icon: <Heart className="w-8 h-8 text-green-600" />,
    title: "Meningkatnya Tren Memasak di Rumah",
    description: "Tren memasak di rumah semakin meningkat, terutama pasca pandemi. Semakin banyak orang mencari opsi makanan yang lebih sehat, terjangkau, dan terkontrol kualitasnya."
  },
  {
    icon: <Users className="w-8 h-8 text-purple-600" />,
    title: "Ledakan Adopsi Digital",
    description: "Tren ini didorong oleh adopsi digital. Indonesia mencatat pertumbuhan tertinggi dalam unduhan aplikasi Makanan & Minuman di Asia Tenggara (~88% YoY pada tahun 2022), menandakan pasar yang sangat besar dan aktif."
  }
];

const problems = [
  {
    number: "1",
    title: "Kebingungan Menentukan Menu Masakan",
    description: "Kesulitan harian dalam memutuskan akan memasak apa dengan bahan yang tersedia."
  },
  {
    number: "2", 
    title: "Pemborosan Makanan di Rumah Tangga",
    description: "Bahan makanan yang tidak dimanfaatkan secara optimal atau terbuang karena tidak ada ide pemanfaatan."
  },
  {
    number: "3",
    title: "Ketidakefisienan Sumber Daya", 
    description: "Penggunaan bahan makanan dan anggaran yang tidak efisien, terutama bagi pelajar atau mahasiswa."
  },
  {
    number: "4",
    title: "Kesenjangan Personalisasi Resep",
    description: "Kesenjangan antara resep online yang umum dengan bahan-bahan spesifik yang dimiliki pengguna."
  }
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're Cooked hadir sebagai solusi sederhana namun bermakna untuk kamu yang hidup jauh dari rumah. 
              Kami membantu anak kost dan siapa pun yang ingin masak enak dengan bahan seadanya, tanpa ribet. 
              Dengan pendekatan berbasis bahan yang kamu miliki, kami bantu kurangi pemborosan makanan, 
              membuat perencanaan masakan jadi lebih praktis, hemat, dan tentunya tetap lezat.
            </p>
          </div>
        </div>
      </div>

            {/* Background & Facts */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latar Belakang & Fakta</h2>
            <div className="w-24 h-1 bg-purple-600 mx-auto mb-8"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {backgroundFacts.map((fact, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start mb-4">
                  {fact.icon}
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{fact.title}</h3>
                    {fact.label && (
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full mb-3">
                        {fact.label}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Why We Built This Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why are we build this?</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</div>
                <h3 className="text-xl font-semibold text-gray-900">Fokus Inovasi Kesehatan</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Kami memilih tema "Inovasi Kesehatan" karena proyek kami secara langsung mendorong gaya hidup yang lebih sehat melalui kebiasaan memasak di rumah, serta mendukung keberlanjutan kesehatan publik dengan menyediakan solusi praktis untuk mengurangi pemborosan makanan.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</div>
                <h3 className="text-xl font-semibold text-gray-900">Menjawab Permasalahan sehari-hari</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Pernyataan masalah ini dipilih karena memiliki relevansi tinggi dengan audiens yang luas, termasuk segmen inti kami yaitu mahasiswa dengan sumber daya terbatas. Hal ini memungkinkan kami untuk menangani permasalahan nyata seperti kebingungan dalam menentukan menu masakan dan pemborosan bahan makanan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problems We Tackle */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Permasalahan yang Kami Tangani</h2>
            <div className="w-24 h-1 bg-red-500 mx-auto mb-8"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-3">
                    {problem.number}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Development Team</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the talented individuals who brought this vision to life through innovative technology and thoughtful design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 bg-red-600 text-white">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-red-100 mb-2">{member.role}</p>
                  <p className="text-sm text-red-100 mb-3">{member.university}</p>
                  <p className="text-sm leading-relaxed text-red-50">{member.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;