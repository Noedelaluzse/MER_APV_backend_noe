import nodemailer from 'nodemailer';

const emailRegistro = async (datos)  => {

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIl_HOST,
      port: process.env.EMAIl_PORT,
      auth: {
        user: process.env.EMAIl_USER,
        pass: process.env.EMAIl_PASS
      }
    });

      const {email, nombre, token} = datos;
      
      // Enviar el email
      const info = await transporter.sendMail({
        from: 'APV - Administrador de PAciente de Veterinaria',
        to: email,
        subject: 'Comprueba tu cuenta en APV',
        text: 'Comprueba tu cuenta en APV',
        html: `<p> ${nombre}, comprueba tu cuenta en APV</p>
              <p> Tu cuenta ya esta lista, solo debes comprobarla en el siguiente enlace: 
                <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
              </p>

              <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      });
      console.log("Mensaje enviado: %s", info.messageId);
}

export default emailRegistro;