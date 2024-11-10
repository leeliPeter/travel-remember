import React from "react";
import Header from "@/components/home-page/Header";
import Intro from "@/components/home-page/intro";
import Footer from "@/components/home-page/footer";
import Features from "@/components/home-page/features";
export default async function Home() {
  return (
    <div>
      <Header />
      <Intro />
      <Features />
      <Footer />
    </div>
  );
}
