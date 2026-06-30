"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Loader2,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/services/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { getInitials, formatDate } from "@/lib/utils";

const profileSchema = yup.object({
  name: yup.string().min(2, "Name too short").required("Name is required"),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Enter valid phone number")
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm password"),
});

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useAppDispatch();
  const { data: profileData, isLoading: isProfileLoading } =
    useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const profile = profileData?.data?.user;

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name,
        phone: profile.phone || "",
      });
    }
  }, [profile, resetProfile]);

  const onProfileSubmit = async (data: any) => {
    try {
      const result = await updateProfile(data).unwrap();
      dispatch(setCredentials(result.data.user as any));
      localStorage.setItem("user", JSON.stringify(result.data.user));
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Password changed successfully!");
      resetPassword();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-zinc-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-zinc-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PROFILE HEADER CARD */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-zinc-100 p-6"
      >
        <div className="flex items-center gap-5">
          {/* AVATAR */}
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback className="bg-primary-light text-primary text-xl font-bold">
                {getInitials(profile?.name || "")}
              </AvatarFallback>
            </Avatar>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md"
            >
              <Camera size={13} className="text-white" />
            </motion.button>
          </div>

          {/* INFO */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-zinc-900">{profile?.name}</h2>
            <p className="text-sm text-zinc-500">{profile?.email}</p>
            <div className="flex items-center gap-3">
              {profile?.isEmailVerified ? (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                  <CheckCircle size={11} />
                  Email verified
                </span>
              ) : (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                  Email not verified
                </span>
              )}
              <span className="text-xs text-zinc-400 capitalize">
                {profile?.role}
              </span>
            </div>
            {profile?.createdAt && (
              <p className="text-xs text-zinc-400">
                Member since {formatDate(profile.createdAt)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* TABS */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-2 bg-zinc-100 p-1 rounded-xl w-fit"
      >
        {[
          { id: "profile", label: "Edit profile", icon: User },
          { id: "password", label: "Change password", icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white text-primary shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* PROFILE FORM */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-zinc-100 p-6"
          >
            <h3 className="font-semibold text-zinc-900 mb-5">
              Personal information
            </h3>
            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-5"
            >
              {/* NAME */}
              <div className="space-y-1.5">
                <Label className="text-zinc-700 flex items-center gap-2">
                  <User size={14} className="text-zinc-400" />
                  Full name
                </Label>
                <Input
                  className={`h-11 ${
                    profileErrors.name ? "border-red-500" : "border-zinc-200"
                  }`}
                  {...registerProfile("name")}
                />
                {profileErrors.name && (
                  <p className="text-red-500 text-xs">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              {/* EMAIL — readonly */}
              <div className="space-y-1.5">
                <Label className="text-zinc-700 flex items-center gap-2">
                  <Mail size={14} className="text-zinc-400" />
                  Email address
                  <span className="text-xs text-zinc-400 font-normal">
                    (cannot be changed)
                  </span>
                </Label>
                <Input
                  value={profile?.email || ""}
                  disabled
                  className="h-11 border-zinc-200 bg-zinc-50 text-zinc-400"
                />
              </div>

              {/* PHONE */}
              <div className="space-y-1.5">
                <Label className="text-zinc-700 flex items-center gap-2">
                  <Phone size={14} className="text-zinc-400" />
                  Phone number
                </Label>
                <div className="flex gap-2">
                  <div className="w-16 h-11 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center text-sm text-zinc-500 shrink-0">
                    +91
                  </div>
                  <Input
                    placeholder="9876543210"
                    maxLength={10}
                    className={`h-11 flex-1 ${
                      profileErrors.phone ? "border-red-500" : "border-zinc-200"
                    }`}
                    {...registerProfile("phone")}
                  />
                </div>
                {profileErrors.phone && (
                  <p className="text-red-500 text-xs">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              {/* ROLE */}
              <div className="space-y-1.5">
                <Label className="text-zinc-700 flex items-center gap-2">
                  <Shield size={14} className="text-zinc-400" />
                  Account type
                </Label>
                <Input
                  value={profile?.role || ""}
                  disabled
                  className="h-11 border-zinc-200 bg-zinc-50 text-zinc-400 capitalize"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdating || !isDirty}
                className="bg-primary hover:bg-primary-hover text-white h-11 px-8"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* PASSWORD FORM */}
        {activeTab === "password" && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-zinc-100 p-6"
          >
            <h3 className="font-semibold text-zinc-900 mb-5">
              Change password
            </h3>
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-5"
            >
              {[
                {
                  id: "currentPassword",
                  label: "Current password",
                  show: showCurrentPassword,
                  setShow: setShowCurrentPassword,
                  register: registerPassword("currentPassword"),
                  error: passwordErrors.currentPassword,
                },
                {
                  id: "newPassword",
                  label: "New password",
                  show: showNewPassword,
                  setShow: setShowNewPassword,
                  register: registerPassword("newPassword"),
                  error: passwordErrors.newPassword,
                },
                {
                  id: "confirmPassword",
                  label: "Confirm new password",
                  show: showConfirmPassword,
                  setShow: setShowConfirmPassword,
                  register: registerPassword("confirmPassword"),
                  error: passwordErrors.confirmPassword,
                },
              ].map(({ id, label, show, setShow, register, error }) => (
                <div key={id} className="space-y-1.5">
                  <Label className="text-zinc-700">{label}</Label>
                  <div className="relative">
                    <Input
                      type={show ? "text" : "password"}
                      className={`h-11 pr-10 ${
                        error ? "border-red-500" : "border-zinc-200"
                      }`}
                      {...register}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs">{error.message}</p>
                  )}
                </div>
              ))}

              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-primary hover:bg-primary-hover text-white h-11 px-8"
              >
                {isChangingPassword ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Changing password...
                  </span>
                ) : (
                  "Change password"
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
