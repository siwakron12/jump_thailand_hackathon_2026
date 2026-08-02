"use client"
import React, { useEffect } from 'react'
import { authClient } from "@/lib/auth-client";
import Footer from './(layout)/footer';
import StudentHomeFeed from './(layout)/Studenthomefeed';
type Props = {}

export default function page({ }: Props) {
  useEffect(() => {
    const fetchSession = async () => {
      const session = await authClient.getSession();
      console.log("Session:", session);
    };
    fetchSession();
  }, []);

  return (
    <div className="w-full lg:w-2/4 mx-auto  h-full">
  
        <StudentHomeFeed />
  
      <div className="pb-20"></div>
      <Footer />
    </div>
  )
}