const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const button = loginForm.querySelector("button");

    button.disabled = true;
    button.textContent = "Entrando...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error("Erro no login:", error);

        alert("E-mail ou senha incorretos.");

        button.disabled = false;
        button.textContent = "Entrar";

        return;
    }

    console.log("Usuário autenticado:", data.user);

    window.location.href = "dashboard.html";
});
