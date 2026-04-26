export const formatearPrecio = (valor) => {
  return `$${Number(valor).toLocaleString()}`;
};