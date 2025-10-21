import { useNavigate } from 'react-router-dom';
import logo from '../assets/img/labastilla-icon.svg';

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center w-[90%] h-[80vh] bg-[#F7F4F1] opacity-90">
      <img src={logo} alt="Logo La Bastilla" className="w-10 mb-6" />
      <h1 className="text-4xl mb-1 font-bold">NUPZIAL | LA BASTILLA</h1>
      <h2 className="text-2xl mb-8">¿Preparado para la boda de tus sueños?</h2>
      <button
        className="px-10 py-3 bg-[#AD5752] text-white rounded-lg text-lg hover:bg-[#661B17] transition"
        onClick={() => navigate('/cargar_archivos')}
      >
        Continuar
      </button>
    </div>
  );
}
