import React, { useEffect, useState } from "react";
import { Loader2, User, Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { api, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { initialsOf } from "../utils/format";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState({ fullName: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) setProfile({ fullName: user.fullName || "" });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      const { data } = await api.put("/users/profile", { fullName: profile.fullName });
      setUser(data.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (savingPw) return;
    if (pw.newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (pw.newPassword !== pw.confirm) {
      return toast.error("New password and confirmation don't match");
    }
    setSavingPw(true);
    try {
      await api.put("/users/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
          Account settings
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage the details of your signed-in account.
        </p>
      </div>

      {/* Identity card */}
      <div className="card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-semibold">
          {initialsOf(user?.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-foreground truncate">
            {user?.fullName || "—"}
          </p>
          <p className="text-sm text-muted flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>
          {user?.createdAt && (
            <p className="text-xs text-muted-2 mt-1">
              Member since {moment(user.createdAt).format("MMMM YYYY")}
            </p>
          )}
        </div>
      </div>

      {/* Account form */}
      <Card icon={User} title="Account">
        <form onSubmit={saveProfile} className="space-y-4">
          <Field
            label="Full name"
            value={profile.fullName}
            onChange={(v) => setProfile({ fullName: v })}
            required
          />
          <Field label="Email" value={user?.email || ""} readOnly />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card icon={Lock} title="Change password">
        <form onSubmit={changePassword} className="space-y-4">
          <Field
            label="Current password"
            type="password"
            value={pw.currentPassword}
            onChange={(v) => setPw({ ...pw, currentPassword: v })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="New password"
              type="password"
              value={pw.newPassword}
              onChange={(v) => setPw({ ...pw, newPassword: v })}
              required
            />
            <Field
              label="Confirm new password"
              type="password"
              value={pw.confirm}
              onChange={(v) => setPw({ ...pw, confirm: v })}
              required
            />
          </div>
          <p className="text-xs text-muted-2">
            Use at least 8 characters. Avoid passwords you use elsewhere.
          </p>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPw} className="btn-secondary">
              {savingPw && <Loader2 className="w-4 h-4 animate-spin" />}
              Update password
            </button>
          </div>
        </form>
      </Card>

      {/* Session */}
      <Card icon={ShieldCheck} title="Session">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted">
            Signing out will require you to log in again on this device.
          </p>
          <button onClick={logout} className="btn-danger">
            Sign out
          </button>
        </div>
      </Card>
    </div>
  );
};

const Card = ({ icon: Icon, title, children }) => (
  <div className="card p-6">
    <div className="flex items-center gap-2 mb-5">
      {Icon && <Icon className="w-5 h-5 text-primary" />}
      <h2 className="font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, onChange, type = "text", required, readOnly, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-foreground mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`input-field ${readOnly ? "text-muted cursor-not-allowed" : ""}`}
    />
  </div>
);

export default Profile;
