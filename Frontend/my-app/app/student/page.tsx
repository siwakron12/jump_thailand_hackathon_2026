"use client"
import React, { useEffect } from 'react'
import { authClient } from "@/lib/auth-client";
import Footer from './(layout)/footer';
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
    <div>

      <Footer/>
    </div>
  )
}