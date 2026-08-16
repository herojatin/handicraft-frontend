import { useState } from "react";
import { X } from "lucide-react";
import BASE_URL from "../../config/api";

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [showQuestionBox, setShowQuestionBox] = useState(false);

  if (!product) return null;

  const increase = () => {
  setQuantity((prev) => Number(prev) + 1);
};

const decrease = () => {
  if (Number(quantity) > 1) {
    setQuantity((prev) => Number(prev) - 1);
  }
};

  const handleCart = () => {
    onAddToCart({
      ...product,
      quantity,
      comment,
    });

    onClose();
  };

  const convertToInch = (cm) => {
    if (!cm) return "-";
    return (Number(cm) / 2.54).toFixed(2);
  };

  const calculateCBM = (length, width, height) => {
    if (!length || !width || !height) return "-";

    return (
      (Number(length) * Number(width) * Number(height)) /
      1000000
    ).toFixed(4);
  };

  console.log(product);
console.log(product.sizes);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 overflow-y-auto">

      <div className="relative bg-white rounded-xl w-full max-w-7xl shadow-xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-600 hover:text-red-600"
        >
          <X size={30} />
        </button>

        <div className="grid lg:grid-cols-2 gap-10 p-10">

          {/* LEFT */}

          <div>

            <img
              src={
                product.images?.length
                  ? `${BASE_URL}/uploads/${product.images[0]}`
                  : "/no-image.png"
              }
              alt={product.productCode}
              className="w-full h-[600px] object-cover rounded-lg border"
            />

          </div>

          {/* RIGHT */}

          <div>

            <h1 className="text-4xl font-bold mb-6">
              {product.productCode}
            </h1>

            <p className="text-gray-600 mb-8 whitespace-pre-line">
              {product.description}
            </p>

            <div className="space-y-3 text-lg">

              <p>
                <strong>Category :</strong>{" "}
                {product.category}
              </p>

              <p>
                <strong>Sub Categories :</strong>{" "}
                {product.subCategory?.join(", ")}
              </p>

              <p>
                <strong>Available Quantity :</strong>{" "}
                {product.quantity}
              </p>

            </div>

            {/* Sizes */}

            <div className="mt-8">

              <h2 className="text-2xl font-semibold mb-4">
                Product Sizes
              </h2>

              <div className="space-y-5">

                {product.sizes?.map((size, index) => (

                  <div
                    key={index}
                    className="border rounded-lg p-5 bg-gray-50"
                  >

                    <p className="font-semibold mb-3">
                      Size {index + 1}
                    </p>

                    <div className="grid grid-cols-2 gap-5">

                      {/* CM */}

                      <div>

                        <h4 className="font-semibold mb-2">
                          Dimensions (CM)
                        </h4>

                        <p>
                          Length : {size.length} cm
                        </p>

                        <p>
                          Width : {size.width} cm
                        </p>

                        <p>
                          Height : {size.height} cm
                        </p>

                      </div>

                      {/* Inches */}

                      <div>

                        <h4 className="font-semibold mb-2">
                          Dimensions (Inches)
                        </h4>

                        <p>
                          Length : {convertToInch(size.length)} in
                        </p>

                        <p>
                          Width : {convertToInch(size.width)} in
                        </p>

                        <p>
                          Height : {convertToInch(size.height)} in
                        </p>

                      </div>

                    </div>

                    {/* CBM */}

                    <div className="mt-4 bg-white border rounded p-3">

                      <strong>CBM :</strong>{" "}
                      {calculateCBM(
                        size.length,
                        size.width,
                        size.height
                      )}{" "}
                      m³

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Quantity */}

           <div className="mt-8">
  <label className="block font-semibold mb-3 text-lg">
    Enter Quantity
  </label>

  <div className="flex items-center gap-3">

   

    <input
      type="number"
      min="1"
      value={quantity}
      onChange={(e) => {
        const value = Number(e.target.value);

        if (value >= 1 || e.target.value === "") {
          setQuantity(e.target.value === "" ? "" : value);
        }
      }}
      onBlur={() => {
        if (quantity === "" || quantity < 1) {
          setQuantity(1);
        }
      }}
      className="w-28 h-12 border rounded text-center text-lg outline-none"
    />

   

  </div>
</div>

           {/* Ask a Question */}

<div className="mt-8">

  <h3 className="text-xl font-semibold mb-4">
    Need More Information?
  </h3>

  <button
    type="button"
    onClick={() => setShowQuestionBox(!showQuestionBox)}
    className="bg-[#c79a63] hover:bg-[#a97b48] text-white px-6 py-3 rounded-md font-semibold transition"
  >
    {showQuestionBox ? "Hide Question Box" : "Ask a Question"}
  </button>

  {showQuestionBox && (
    <textarea
      rows={5}
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Write your question about this product..."
      className="w-full border rounded-lg p-4 resize-none mt-4"
    />
  )}

</div>

            {/* Button */}

            <button
              onClick={handleCart}
              className="mt-8 bg-[#b18152] hover:bg-[#94663c] text-white px-10 py-3 rounded-lg font-semibold transition"
            >
              Add to Cart
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default QuickViewModal;