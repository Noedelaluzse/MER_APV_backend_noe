import emailRegistro from "../helpers/emailRegistro.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Veterinario from "../models/Veterinario.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
const registrar =  async (req, res) => {
    
    const {email, nombre} = req.body;
    // Prevenir usuarios duplicados
    const existeUsuario = await Veterinario.findOne({email});

    if (existeUsuario) {{
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});
    }}
    try {
        // Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // Enviar el email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        res.json({msg: veterinarioGuardado});
    } catch (error) {
        console.log(error);
    }

}

const perfil = (req, res) => {
    const {veterinario} = req;
    res.json(veterinario);
}

const confirmar = async (req, res) => {
    const { token } = req.params;
    
    const usuariosConfirmar = await Veterinario.findOne({token});

    if (!usuariosConfirmar) {
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message});
    }

    try {

        usuariosConfirmar.token = null; // eliminando el token
        usuariosConfirmar.confirmado = true; // Confirmando la cuenta
        await usuariosConfirmar.save(); // Guardanndo los cambios en la base de datos
        res.json({msg: 'Usuario Confirmado Correctamente'});
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) => {

    const {email, password} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});

    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    }
    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});
    }

    // Revisar el password
    if ( await usuario.comprobarPassword(password)) {

        // Autenticar el usuario
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)

        });
    } else {
        const error = new Error('El password es incorreccto');
        return res.status(403).json({msg: error.message});
    }
   
}

const olvidePassword = async (req, res) => {

    const {email} = req.body;

    const existeVeterinario = await Veterinario.findOne({email});

    if ( !existeVeterinario) {
        const error = new Error('El usuairo no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        // Enviar emial 
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })
        res.json({msg: "Hemos enviado un email con las instrucciones"});
    } catch(error) {    
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    
    const tokenValido = await Veterinario.findOne({token});

    if (tokenValido) {
        // El token es valido, el usuario existe
        res.json({msg: 'Token valido y el usuario existe'});
    } else {
        const error = new Error('Token no valido');
        return res.status(400).json({msg: error.message});
    }



}

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});
    
    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

     try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        return res.json({msg: 'Password modificado correctamente'});
        
     } catch (e) {
        console.log(e);
     }
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);

    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    const {email} = req.body;

    if (veterinario.email !== req.body.email) {
        
        const existEmail = await Veterinario.findOne({email});
        if(existEmail) {
            const error = new Error("Ese email ya esta en uso");
            return res.status(400).json({msg: error.message});
        }
    }
    try {
        veterinario.nombre = req.body.nombre || veterinario.nombre;
        veterinario.email = req.body.email || veterinario.email;
        veterinario.web = req.body.web || veterinario.web;
        veterinario.telefono = req.body.telefono || veterinario.telefono;

        const veterinarioActualizado = await veterinario.save();
        return res.json(veterinarioActualizado);

    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) => {

    // Leer los datos
    const {id} = req.veterinario;
    const {pwd_actual, pwd_nuevo} = req.body;
    
    // Comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id);
    if(!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message});
    }

    // Comprobar su password
    if(await veterinario.comprobarPassword(pwd_actual)) {
         // Almacenar el nuevo password
         veterinario.password = pwd_nuevo;
         await veterinario.save();
         return res.json({msg: 'Password Almacenado Correctamente'});
    } else {
        const error = new Error("El Password Actual es Incorrecto");
        return res.status(400).json({msg: error.message});  
    }
   



}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}