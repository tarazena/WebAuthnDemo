<template>
  <section>
    <section>
      <h2>Demo - Signup</h2>
      <table>
        <thead>
          <tr>
            <td colspan="2" v-if="error">Error: Couldn't Register User!</td>
            <td colspan="2" v-if="userIsAlreadyRegistered">Error: User Is Already Registered!</td>
          </tr>
          <tr>
            <td>Regular Auth</td>
            <td>WebAuthn</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="max-width: 400px">
              <form>
                <div>
                  <p class="formP">Please fill in this form to create an account.</p>
                  <hr>
                  <label for="name">
                    <p class="smallLabel">Name</p>
                  </label>
                  <input type="text" placeholder="Enter name" v-model="name" name="name" required>
                  <label for="email">
                    <p class="smallLabel">Email</p>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Email"
                    v-model="email"
                    name="email"
                    required
                  >
                  <label for="psw">
                    <p class="smallLabel">Password</p>
                  </label>
                  <input
                    type="password"
                    v-model="password"
                    placeholder="Enter Password"
                    name="psw"
                    required
                  >
                  <div class="clearfix">
                    <button @click="normalRegister" type="button" class="signupbtn">Sign Up</button>
                  </div>
                </div>
              </form>
            </td>
            <td style="max-width: 400px">
              <form>
                <div class="container">
                  <p class="formP">Please fill in this form to create an account.</p>
                  <hr>
                  <label for="name">
                    <p class="smallLabel">Name</p>
                  </label>
                  <input type="text" placeholder="Enter name" v-model="name" name="name" required>
                  <label for="email">
                    <p class="smallLabel">Email</p>
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
                    <p class="smallLabel">Email</p>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Email"
                    v-model="email"
                    name="email"
                    required
                  >
                  <label for="psw">
                    <p class="smallLabel">Password</p>
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
                    <p class="smallLabel">Email</p>
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
import axios from "axios";

export default {
  data: function() {
    return {
      webAuthnEmail: "",
      password: "",
      email: "",
      name: "",
      userIsRegistered: false,
      userIsRegisteredWebAuthn: true,
      userIsAlreadyRegistered: false,
      error: false
    };
  },
  methods: {
    normalSubmit() {
      event.preventDefault();
    },
    resetForm() {
      this.userIsRegistered = false;
      this.userIsRegisteredWebAuthn = false;
      this.userIsAlreadyRegistered = false;
      this.error = false;
    },
    normalRegister() {
      this.resetForm();
      const user = {
        userName: this.email,
        password: this.password,
        displayName: this.name
      };

      const self = this;
      axios
        .post(
          "http://localhost:5000/webauthn-daa90/us-central1/widgets/register",
          user
        )
        .then(() => {
          self.userIsRegistered = true;
        })
        .catch(error => {
          if(error.response.status === 409) {
            self.userIsAlreadyRegistered = true;
          } else {
            error = true;
          }
        });
    },
    webAuthnSubmit: async function() {
      this.resetForm();
      const user = {
        userName: this.webAuthnEmail,
        displayName: this.name
      };
      const self = this;
      axios
        .post(
          "http://localhost:5000/webauthn-daa90/us-central1/api/register",
          user
        )
        .then((response) => {
          const a = self.preformatMakeCredReq(response.data);
          return self.getLoginChallenge(a);
        })
         .catch(error => {
          if(error.response.status === 409) {
            self.userIsAlreadyRegistered = true;
          } else {
            error = true;
          }
        });
    },
    getLoginChallenge: async function(creds) {
      const publicKey = {
        challenge: creds.challenge,
        rp: creds.rp,
        user: creds.user,
        pubKeyCredParams: creds.pubKeyCredParams
      };

      return await navigator.credentials
        .create({ publicKey })
        .then(newCredentialInfo => {
          const data = this.formatCredResponse(newCredentialInfo);
          return axios.post("http://localhost:5000/webauthn-daa90/us-central1/api/response", {...data, userID: creds.user.name}).then((response) => {
            return response.data;
          }).catch(error => {
            return error;
          });
        })
        .catch(error => {
          // eslint-disable-next-line
          console.log(error);
        });
    },
    preformatMakeCredReq(makeCredReq) {
      // const c = JSON.parse(makeCredReq);
      makeCredReq.challenge = Buffer.from(makeCredReq.challenge.data);
      makeCredReq.user.id = Buffer.from(makeCredReq.user.id);
      return makeCredReq;
    },
    formatCredResponse(creds) {
      return {
        id: creds.id,
        rawId: Buffer.from(creds.rawId),
        response: {
          attestationObject: Buffer.from(creds.response.attestationObject),
          clientDataJSON: Buffer.from(creds.response.clientDataJSON)
        },
        type: creds.type
      };
    }
  }
};
</script>

<style scoped>
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

.smallLabel {
  font-size: 28px !important;
  margin: 0px;
  line-height: 0.3;
}
/* Change styles for cancel button and signup button on extra small screens */
@media screen and (max-width: 300px) {
  .cancelbtn,
  .signupbtn {
    width: 100%;
  }
}
</style>
