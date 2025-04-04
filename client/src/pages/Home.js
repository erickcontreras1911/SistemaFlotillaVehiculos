import SidebarLayout from "../layouts/SidebarLayout";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function Home() {
  return (
    <SidebarLayout>
      <div className="container mt-4">
        <h1 className="mb-4">Bienvenido al Sistema de Flotillas</h1>

        {/* Carrusel Bootstrap-like usando react-responsive-carousel */}
        <Carousel autoPlay infiniteLoop showThumbs={false} className="mb-5">
          <div>
            <img src="/images/flota1.jpg" alt="Flota 1" />
          </div>
          <div>
            <img src="/images/flota2.jpg" alt="Flota 2" />
          </div>
          <div>
            <img src="/images/flota3.jpg" alt="Flota 3" />
          </div>
        </Carousel>

        {/* Cards de Bootstrap */}
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Gestión de Empleados</h5>
                <p className="card-text">Administra la información de los empleados del sistema.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Control de Vehículos</h5>
                <p className="card-text">Gestiona la información de los vehículos de la flotilla.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Historial de Mantenimiento</h5>
                <p className="card-text">Consulta el mantenimiento y las reparaciones de los vehículos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
