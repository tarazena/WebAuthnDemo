<template>
  <section>
    <h2>Weak Authentication</h2>
    <p>In general, "weak" authentication systems are characterized by protocols that either leak the password directly over the network or that leak sufficient information while performing authentication to allow intruders to deduce or guess at the password.</p>
    <section>
      <h2>Cleartext Passwords</h2>
      <p>The most obvious (and insecure) method of authentication is to store the password in a database somewhere on the server. During authentication, the client sends the password directly to the server, and the server compares this with the stored value. The security problems with this are obvious.</p>
    </section>
    <section>
      <h2>Hashed Passwords</h2>
      <p>Several decades ago, it was discovered that a server did not have to store a user's password in cleartext form anywhere on the system in order to perform password authentication. Instead, the user's password could be run through a one-way hash function, which would convert it into a random-looking sequence of bytes.</p>
    </section>
    <section>
      <h2>Challenge-Response</h2>
      <p>To avoid revealing passwords directly over an untrusted network, challenge-response systems were developed. At their simplest, the server sends the user some sort of challenge, which would typically be some sort of random string. The user would then compute a response, usually some function based on both the challenge and the password. This way, even if an intruder captures a valid challenge-response pair, it will not help him gain access to the system since future challenges are likely to be different and thus require different responses.</p>
    </section>
     <section>
      <p>81% of all hacking-related breaches leverage stolen or weak passwords.</p>
    </section>
  </section>
</template>

<script>
export default {

}
</script>

<style>

</style>
