import { useContext, useState } from "react";
import { CartContext } from "../../../context/CartContext";
import { db } from "../../../firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import Checkout from "./Checkout";
import { Link } from "@mui/material";

const CheckoutContainer = () => {
  const { cart, getTotalPrice, clearCart } = useContext(CartContext);
  const [orderId, setOrderId] = useState("");
  let total = getTotalPrice();

  const { handleSubmit, handleChange, errors } = useFormik({
    initialValues: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      repeatEmail: "",
    },
    onSubmit: (data) => {
      let order = {
        buyer: data,
        items: cart,
        total,
        date: serverTimestamp(),
        status: "generate",
      };
      //-----crear la orden en Firebase-----
      const ordersCollection = collection(db, "orders");
      addDoc(ordersCollection, order).then((res) => setOrderId(res.id));
      //----- Modificar el STOCK en FIREBASE de cada documento -----
      cart.forEach((product) => {
        updateDoc(doc(db, "products", product.id), {
          stock: product.stock - product.quantity,
        });
      });
      clearCart();
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Este campo es obligatorio"),
      lastName: Yup.string().required("Este campo es obligatorio"),
      phone: Yup.string().required("Este campo es obligatorio"),
      email: Yup.string().required().email("El email es incorrecto"),
      repeatEmail: Yup.string()
        .required("Este campo es obligatorio")
        .oneOf([Yup.ref("email")], "Los email no coinciden"),
    }),
    validateOnChange: false,
  });

  return (
    <div>
      {orderId ? (
        <div>
          <h3>Gracias por tu compra</h3>
          <h4>Tu número de compra es: {orderId}</h4>
          <Link to="/">Volver a comprar</Link>
        </div>
      ) : (
        <Checkout
          orderId={orderId}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          cart={cart}
          total={total}
          errors={errors}
        />
      )}
    </div>
  );
};

export default CheckoutContainer;
