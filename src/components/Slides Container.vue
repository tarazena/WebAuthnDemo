<template>
  <div class="reveal">
    <div class="slides">
      <SubjectSlide/>
      <!-- 
        History of Password Issues
        Intro WebAuthn
        What is it?
        Live Demo
          Side by side web sign up
          screen shot of DB
          Side by side web log in
          How it works
        Why this is more secure
        What the future of passwrds
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

export default {
  name: "SlidesContainer",
  components: {
    OutroSlide,
    SubjectSlide
  }
};
</script>

<style>
</style>
