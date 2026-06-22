import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },

    // ✅ Pricing
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val <= this.price;
        },
        message: "Discount price must be less than or equal to price",
      },
    },

    // ✅ Categorization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    // ✅ Seller
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Images
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    // ✅ Variants (size, color combinations)
    variants: [
      {
        size: { type: String }, // S, M, L, XL or 6, 7, 8 (shoes)
        color: { type: String },
        sku: { type: String, unique: true, sparse: true },
        stock: { type: Number, default: 0, min: 0 },
        price: { type: Number }, // optional override price
        images: [
          {
            url: String,
            public_id: String,
          },
        ],
      },
    ],

    // ✅ Stock (for products without variants)
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ Specifications (dynamic key-value pairs)
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],

    // ✅ Tags for search
    tags: [String],

    // ✅ Ratings (calculated from reviews)
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    // ✅ Sales tracking
    sold: {
      type: Number,
      default: 0,
    },

    // ✅ Status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "out-of-stock"],
      default: "draft",
    },

    // ✅ Featured products
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ✅ SEO
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true },
);

// ✅ Auto-generate slug
productSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true }) + "-" + Date.now();
  }
});

// ✅ Indexes for search performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ "ratings.average": -1 });

// ✅ Virtual - calculate total stock (sum of all variants + base stock)
productSchema.virtual("totalStock").get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return this.stock;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
