<template>
  <section>
    <section>
      <h2>Demo - Signup</h2>  
    <table>
      <thead>
        <tr>
          <td>Regular Auth</td>
          <td>WebAuthn</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="max-width: 400px">
            <form @submit="normalSubmit">
              <div>
                <p class="formP">Please fill in this form to create an account.</p>
                <hr>
                <label for="email">
                  <p>Email</p>
                </label>
                <input type="text" placeholder="Enter Email" v-model="email" name="email" required>
                <label for="psw">
                  <b>Password</b>
                </label>
                <input
                  type="password"
                  v-model="password"
                  placeholder="Enter Password"
                  name="psw"
                  required
                >
                <div class="clearfix">
                  <button type="submit" class="signupbtn">Sign Up</button>
                </div>
              </div>
            </form>
          </td>
          <td style="max-width: 400px">
            <form>
              <div class="container">
                <p class="formP">Please fill in this form to create an account.</p>
                <hr>
                <label for="email">
                  <b>Email</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter Email"
                  v-model="webAuthnEmail"
                  name="email"
                  required
                >
                <div class="clearfix">
                  <button type="button" @click="webAuthnSubmit" class="signupbtn">Sign Up</button>
                </div>
              </div>
            </form>
          </td>
        </tr>
      </tbody>
    </table>
    </section>
    <section>
      <h2>Demo - Login</h2>
      <table>
      <thead>
        <tr>
          <td>Regular Auth</td>
          <td>WebAuthn</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="max-width: 400px">
            <form @submit="normalSubmit">
              <div>
                <p class="formP">Please fill in this form to create an account.</p>
                <hr>
                <label for="email">
                  <p>Email</p>
                </label>
                <input type="text" placeholder="Enter Email" v-model="email" name="email" required>
                <label for="psw">
                  <b>Password</b>
                </label>
                <input
                  type="password"
                  v-model="password"
                  placeholder="Enter Password"
                  name="psw"
                  required
                >
                <div class="clearfix">
                  <button type="submit" class="signupbtn">Login</button>
                </div>
              </div>
            </form>
          </td>
          <td style="max-width: 400px">
            <form>
              <div class="container">
                <p class="formP">Please fill in this form to create an account.</p>
                <hr>
                <label for="email">
                  <b>Email</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter Email"
                  v-model="webAuthnEmail"
                  name="email"
                  required
                >
                <div class="clearfix">
                  <button type="button" @click="webAuthnSubmit" class="signupbtn">Login</button>
                </div>
              </div>
            </form>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  </section>
</template>

<script>
export default {
  data: function() {
    return {
      webAuthnEmail: "",
      password: "",
      email: ""
    };
  },
  methods: {
    normalSubmit() {
      event.preventDefault();
    },
    webAuthnSubmit: async function() {
      const user = {
        name: this.webAuthnEmail,
        displayName: "Hassan",
        id: Uint8Array.from("UZSL85T9AFC", c => c.charCodeAt(0))
      };

      await this.getLoginChallenge(user);
    },
    getLoginChallenge: async function(user) {
      var randomChallengeBuffer = new Uint8Array(32);
      window.crypto.getRandomValues(randomChallengeBuffer);
      const publicKey = {
        challenge: randomChallengeBuffer,
        rp: {
          name: "Hassan Al Rawi"
        },
        user: user,
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "cross-platform"
        },
        attestation: "direct"
      };

      await navigator.credentials.create({ publicKey }).then((newCredentialInfo) => {
        // eslint-disable-next-line
        console.log(newCredentialInfo);
      }).catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      });
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

.formP {
  font-size: 20px;
}
/* Full-width input fields */
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 15px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

input[type="text"]:focus,
input[type="password"]:focus {
  background-color: #ddd;
  outline: none;
}

hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for all buttons */
button {
  background-color: #4caf50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
  opacity: 0.9;
}

button:hover {
  opacity: 1;
}

/* Extra styles for the cancel button */
.cancelbtn {
  padding: 14px 20px;
  background-color: #f44336;
}

/* Float cancel and signup buttons and add an equal width */
.cancelbtn,
.signupbtn {
  width: 100%;
}

/* Add padding to container elements */
.container {
  padding: 16px;
}

/* Clear floats */
.clearfix::after {
  content: "";
  clear: both;
  display: table;
}

/* Change styles for cancel button and signup button on extra small screens */
@media screen and (max-width: 300px) {
  .cancelbtn,
  .signupbtn {
    width: 100%;
  }
}
</style>
