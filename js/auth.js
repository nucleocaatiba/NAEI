const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("E-mail:", email);
    console.log("Senha:", password);

    alert("Login ainda não conectado ao Supabase.");
});
