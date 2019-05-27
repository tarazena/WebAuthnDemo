<template>
    <section>
        <section>
            <h2>Does WebAuthn Replace OAuth??</h2>
        </section>
        <section>
            <p>No! In fact, WebAuthn and OAuth work great together! 
            While WebAuthn can often take the place of using a specific third-party OAuth API for authentication, 
            WebAuthn isn't trying to solve the same problems OAuth solves.</p>
        </section>
        <section>
            <p>WebAuthn authenticates users, so if that's all you're using OAuth for (you shouldn't), 
            then you may not need OAuth! But if you're using OAuth in order to access an API, 
            then you'll still need OAuth, as that's how you get an access token.</p>
        </section>
        <section>
            <p>WebAuthn may end up replacing the step in OAuth where the user enters their password, 
            since WebAuthn is a replacement for password authentication. But WebAuthn won't provide 
            an app with an access token to make API requests, since that's not what it's designed for.</p>
        </section>
    </section>
</template>

<script>
export default {

}
</script>

<style>

</style>
