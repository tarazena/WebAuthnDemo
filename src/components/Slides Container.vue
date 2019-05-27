<template>
  <div class="reveal">
    <div class="slides">
      <SubjectSlide/>
      <History />
      <WebAuthn />
      <Benefits />
      <ReplaceOAuth />
      <Signup /> 
      <!-- 
        History of Password Issues    -- done
        Intro WebAuthn    -- done
        What is it?   -- done
        Does WebAuthn Replace OAuth??
        What the future of passwrds
        Live Demo
          Side by side web sign up --done
          screen shot of DB   -- done
          Side by side web log in
          How it works
        Questions?
        Outro, Maybe add Snake?
      -->
      <OutroSlide/>
    </div>
  </div>
</template>

<script>
import OutroSlide from "./Slides/OutroSlide";
import SubjectSlide from "./Slides/SubjectSlide";
import History from "./Slides/History";
import WebAuthn from "./Slides/webAuthn";
import Benefits from "./Slides/Benefits";
import Signup from "./Slides/Signup";
import ReplaceOAuth from "./Slides/ReplaceOAuth";

export default {
  name: "SlidesContainer",
  components: {
    SubjectSlide,
    History,
    WebAuthn,
    Benefits,
    ReplaceOAuth,
    Signup,
    OutroSlide
  }
};
</script>

<style>
</style>
