<template>
  <section>
    <h2>Benefits</h2>
    <section>
      <h2>Strong</h2>
      <p>Authentication is ideally backed by a Hardware Security Module, which can safely store private keys and perform the cryptographic operations needed for WebAuthn.</p>
    </section>
    <section>
      <h2>Scoped</h2>
      <p>A keypair is only useful for a specific origin, like browser cookies. A keypair registered at 'webauthn.guide' cannot be used at 'evil-webauthn.guide', mitigating the threat of phishing.</p>
    </section>
    <section>
      <h2>Attested</h2>
      <p>Authenticators can provide a certificate that helps servers verify that the public key did in fact come from an authenticator they trust, and not a fraudulent source.</p>
    </section>
  </section>
</template>

<script>
export default {

}
</script>

<style>

</style>
