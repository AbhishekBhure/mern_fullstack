import React, { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, getProduct } from "../../actions/productAction";
import { useAlert } from "react-alert";
import "./Home.css";
import Product from "./ProductCard.js";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader/Loader";

//For Temporary Product view
// const product = {
//   name: "blue t-shirt",
//   images: [{ url: "https://i.ibb.co/DRST11n/1.webp" }],
//   price: "₹2000",
//   _id: "don",
// };

const Home = () => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const { loading, error, products } = useSelector((state) => state.products);

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
    dispatch(getProduct());
  }, [dispatch, error, alert]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="ECOMMERCE" />
          <div className="banner">
            <p>Welcome to Ecommerce</p>
            <h1>Find Products Below</h1>
            <a href="#container">
              <button>Scroll </button>
            </a>
          </div>
          <h2 className="homeHeading">Featured Products</h2>
          <div className="container" id="container">
            {products &&
              products.map((product) => (
                <Product key={product._id} product={product} />
              ))}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
