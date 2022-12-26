import express from 'express';
import conectarDB from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors'; // Proteger la api para que no se consuman los datos
import veterinarioRoutes from "./routes/veterinarioRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";

const app = express(); // creando el servidor
app.use(express.json()); // habilitando las respuesta json del servidor
dotenv.config(); // configurando las variables de enterno
conectarDB(); // Conectando a la base de datos


const dominiosPermitidos = [process.env.FRONTEND_URL, process.env.FRONTEND_URL2];

const corsOptions = {
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1 ) {
            // El origen del request esta permitido
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

app.use(cors(corsOptions));

app.use('/api/veterinarios', veterinarioRoutes ); // Cargando las rutas de veterinarios
app.use('/api/pacientes', pacienteRoutes ); // Cargando las rutas de pacientes

const PORT = process.env.PORT  || 4000
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});

