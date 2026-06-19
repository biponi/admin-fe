import React from "react";
import {
  Mail,
  Calendar,
  UserPlus,
  MessageCircle,
  Briefcase,
  Phone,
  MapPin,
} from "lucide-react";
import { UserPerformanceDetailResponse } from "../../../api/adminAudit";

interface UserProfileHeaderProps {
  name: string;
  email: string;
  avatar: string;
  role: string;
  phoneNumber: string;
  joinedDate?: string;
  userDetail: UserPerformanceDetailResponse | null;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  email,
  avatar,
  role,
  phoneNumber,
  joinedDate,
  userDetail,
}) => {
  const totalOps = userDetail
    ? userDetail.summary.totalOrderActions +
      userDetail.summary.totalProductAdjustments
    : null;

  return (
    <div className='relative overflow-hidden rounded-3xl min-h-[380px] pb-8'>
      {/* Deep gradient background */}
      <div className='absolute inset-0 bg-gradient-to-tr from-[#0891b2] via-[#1d4ed8] to-[#3730a3]' />

      {/* Ambient orbs */}
      <div
        className='absolute -top-24 -left-16 w-80 h-80 rounded-full pointer-events-none'
        style={{
          background:
            "radial-gradient(circle, rgba(83,52,131,0.55) 0%, transparent 70%)",
        }}
      />
      <div
        className='absolute -bottom-16 -right-10 w-64 h-64 rounded-full pointer-events-none'
        style={{
          background:
            "radial-gradient(circle, rgba(233,69,96,0.45) 0%, transparent 70%)",
        }}
      />
      <div
        className='absolute top-16 right-20 w-48 h-48 rounded-full pointer-events-none'
        style={{
          background:
            "radial-gradient(circle, rgba(15,52,96,0.6) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center pt-9 px-6'>
        {/* Avatar */}
        <div className='relative mb-4'>
          <div
            className='w-28 h-28 rounded-full p-[3px]'
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 100%)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}>
            <div className='w-full h-full rounded-full overflow-hidden bg-[#2a2a4a]'>
              <img
                src={
                  avatar ||
                  "https://img.freepik.com/premium-photo/picture-monkey-s-head-with-yellow-eyes_1053683-2247.jpg?semt=ais_hybrid&w=740&q=80"
                }
                alt={name}
                className='w-full h-full object-cover rounded-full'
              />
            </div>
          </div>
          {/* Online dot */}
          <div
            className='absolute bottom-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-emerald-400 border-[3px] border-white/90'
            style={{ boxShadow: "0 0 8px rgba(48,209,88,0.5)" }}
          />
        </div>

        {/* Name */}
        <h1
          className='text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1'
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}>
          {name}
        </h1>

        {/* Role chip */}
        <div
          className='inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-white/90 text-xs font-medium uppercase tracking-wide mb-2.5'
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "0.5px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(8px)",
          }}>
          <Briefcase className='w-3 h-3' />
          {role}
        </div>

        {/* Email + Joined */}
        <div className='flex items-center gap-2 text-white/60 text-sm mb-5'>
          <Mail className='w-3.5 h-3.5' />
          <span>{email}</span>
          <span className='w-1 h-1 rounded-full bg-white/30' />
          {joinedDate && (
            <>
              <Calendar className='w-3.5 h-3.5' />
              <span>{joinedDate}</span>
            </>
          )}
        </div>

        {/* Frosted glass stats — the Apple panel */}
        {!!userDetail && (
          <div
            className='w-full max-w-sm rounded-2xl overflow-hidden'
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "0.5px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.10)",
            }}>
            <div className='flex'>
              {[
                {
                  value: totalOps?.toLocaleString() ?? "—",
                  label: "All time ops",
                },
                {
                  value: userDetail.summary.totalOrderActions.toLocaleString(),
                  label: "Order actions",
                },
                {
                  value:
                    userDetail.summary.totalProductAdjustments.toLocaleString(),
                  label: "Stock adjustments",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className='flex-1 text-center py-4 px-2 relative'
                  style={
                    i < 2
                      ? {
                          borderRight: "0.5px solid rgba(255,255,255,0.18)",
                        }
                      : {}
                  }>
                  <div
                    className='text-xl sm:text-2xl font-bold text-white leading-none mb-1'
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                    {stat.value}
                  </div>
                  <div className='text-[11px] text-white/55 font-medium'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className='flex items-center gap-1.5 text-white/40 text-xs mt-3.5'>
          <MapPin className='w-3 h-3' />
          Dhaka, Bangladesh
        </div>
      </div>
    </div>
  );
};
