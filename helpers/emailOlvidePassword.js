import nodemailer from 'nodemailer';

const emailOlvidePassword = async (datos)  => {

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
        subject: 'Reestablece tu Password',
        text: 'Reestablece tu Password',
        html: `<p> ${nombre}, haz solicitado reestablecer tu password</p>
              <p> Sigue el siguiente enlace para generar un nuevo password: 
                <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
              </p>

              <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      });
      console.log("Mensaje enviado: %s", info.messageId);
}

export default emailOlvidePassword;