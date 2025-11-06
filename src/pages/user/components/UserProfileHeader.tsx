import React from "react";
import {
  Mail,
  Calendar,
  UserPlus,
  MessageCircle,
  Briefcase,
  Phone,
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
  return (
    <div className='min-h-auto  p-4 sm:py-8 sm:px-24 flex bg-transparent items-center justify-center relative'>
      {/* Profile Card */}
      <div className='relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-visible'>
        {/* Top Action Buttons */}
        <div className=' justify-between items-center p-4 sm:p-6 hidden'>
          <button className='flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors font-medium text-sm sm:text-base'>
            <UserPlus className='w-5 h-5' />
            <span>Connect</span>
          </button>
          <button className='flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors font-medium text-sm sm:text-base'>
            <MessageCircle className='w-5 h-5' />
            <span>Message</span>
          </button>
        </div>

        {/* Avatar Section */}
        <div className='flex justify-center -mt-[50px] md:-mt-[50px]'>
          <div className='relative'>
            <div className='w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-white to-gray-100 p-2 shadow-2xl'>
              <img
                src={
                  !!avatar
                    ? avatar
                    : "https://img.freepik.com/premium-photo/picture-monkey-s-head-with-yellow-eyes_1053683-2247.jpg?semt=ais_hybrid&w=740&q=80"
                }
                alt={name}
                className='w-full h-full rounded-full object-cover'
              />
            </div>
            {/* Online Status Indicator */}
            <div className='absolute bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 border-4 border-white rounded-full shadow-lg' />
          </div>
        </div>

        {/* User Info */}
        <div className='text-center px-4 sm:px-6 mt-4 sm:mt-6'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            {name}
          </h1>

          {!!joinedDate && (
            <div className='flex items-center justify-center text-gray-500 text-sm sm:text-base mb-4'>
              <Calendar className='w-4 h-4 mr-1' />
              <span>{joinedDate}</span>
            </div>
          )}

          <div className='space-y-2 mb-6'>
            <div className='flex items-center justify-center text-gray-600 text-sm sm:text-base uppercase font-semibold'>
              <Briefcase className='w-4 h-4 mr-2' />
              <span>{role}</span>
            </div>
            <div className='flex justify-center items-center gap-2'>
              <div className='flex items-center justify-center text-gray-600 text-sm sm:text-base'>
                <Mail className='w-4 h-4 mr-2' />
                <span>{email}</span>
              </div>
              <div className='hidden items-center justify-center text-gray-600 text-sm sm:text-base'>
                <Phone className='w-4 h-4 mr-2' />
                <span>{phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {!!userDetail && (
            <div className='flex justify-center gap-8 sm:gap-12 md:gap-16 mb-8'>
              <div className='text-center'>
                <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800'>
                  {(
                    userDetail.summary.totalOrderActions +
                    userDetail.summary.totalProductAdjustments
                  ).toLocaleString()}
                </div>
                <div className='text-xs sm:text-sm text-gray-500 mt-1'>
                  All time operations
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800'>
                  {userDetail.summary.totalOrderActions}
                </div>
                <div className='text-xs sm:text-sm text-gray-500 mt-1'>
                  Order Actions
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800'>
                  {userDetail.summary.totalProductAdjustments}
                </div>
                <div className='text-xs sm:text-sm text-gray-500 mt-1'>
                  Stock Adjustments
                </div>
              </div>
            </div>
          )}

          {/* Show More Button */}
          {/* <div className='pb-8'>
            <button className='px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-full text-sm sm:text-base hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95'>
              Show more
            </button>
          </div> */}
        </div>
      </div>

      {/* Floating Action Button (like in the image) */}
      {/* <button className='fixed bottom-8 right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300'>
        <svg
          className='w-6 h-6 sm:w-7 sm:h-7 text-pink-400'
          fill='currentColor'
          viewBox='0 0 20 20'>
          <path d='M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z' />
        </svg>
      </button> */}
    </div>
  );
};
