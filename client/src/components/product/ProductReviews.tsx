"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { toast } from "sonner";

interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  ratings: number;
  reviewCount: number;
}

const ratingCounts = [5, 4, 3, 2, 1];

export default function ProductReviews({
  productId,
  reviews,
  ratings,
  reviewCount,
}: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to submit a review");
      return;
    }
    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }
    setIsSubmitting(true);
    // API call will be added later
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Review submitted successfully!");
    setShowForm(false);
    setUserRating(0);
    setComment("");
    setIsSubmitting(false);
  };

  const getRatingCount = (star: number) => {
    return reviews.filter((r) => Math.floor(r.rating) === star).length;
  };

  return (
    <div className="space-y-8">
      {/* RATING SUMMARY */}
      <div className="flex flex-col sm:flex-row gap-8 p-6 bg-zinc-50 rounded-2xl">
        {/* OVERALL RATING */}
        <div className="flex flex-col items-center justify-center sm:border-r border-zinc-200 sm:pr-8">
          <span className="text-6xl font-bold text-zinc-900">
            {ratings.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={
                  i < Math.round(ratings)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300"
                }
              />
            ))}
          </div>
          <span className="text-sm text-zinc-500">{reviewCount} reviews</span>
        </div>

        {/* RATING BARS */}
        <div className="flex-1 space-y-2">
          {ratingCounts.map((star) => {
            const count = getRatingCount(star);
            const percentage =
              reviewCount > 0 ? (count / reviewCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-4">{star}</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: star * 0.1 }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-zinc-500 w-4">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* WRITE REVIEW BUTTON */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900">
          Customer reviews ({reviewCount})
        </h3>
        <Button
          onClick={() => {
            if (!isLoggedIn) {
              toast.error("Please login to write a review");
              return;
            }
            setShowForm(!showForm);
          }}
          variant="outline"
          className="border-primary text-primary hover:bg-primary-light"
        >
          Write a review
        </Button>
      </div>

      {/* REVIEW FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
              <h4 className="font-semibold text-zinc-900">Your review</h4>

              {/* STAR SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-600">Rating</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredRating(i + 1)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setUserRating(i + 1)}
                    >
                      <Star
                        size={28}
                        className={
                          i < (hoveredRating || userRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-300"
                        }
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-600">Review</label>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-24 resize-none border-zinc-200"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-hover text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit review"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-zinc-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVIEWS LIST */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Star size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-3"
            >
              {/* REVIEWER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {review.user.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                {/* STARS */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-200"
                      }
                    />
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <p className="text-sm text-zinc-600 leading-relaxed">
                {review.comment}
              </p>

              {/* HELPFUL */}
              <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                <ThumbsUp size={13} />
                Helpful ({review.helpful})
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
