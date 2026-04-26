import jwt from "jsonwebtoken";

export const generarToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      empresa_id: user.empresa_id,
      rol_id: user.rol_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};