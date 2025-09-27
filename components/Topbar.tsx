"use client";
import React from "react";
import Link from "next/link";

const Topbar = () => {
  return (
    <div
      className="navbar bg-base-100 shadow-sm 
      top-0 z-50 justify-center flex"
    >
      <Link className=" text-4xl font-bold text-center flex font-mono" href="/">
        Label Markers
      </Link>
    </div>
  );
};

export default Topbar;
