
/* ========================================
   PRONTUÁRIO - NAEI
======================================== */

// ========================================
// ELEMENTOS
// ========================================

const userName = document.getElementById("user-name");
const userRole = document.getElementById("user-role");
const logoutButton = document.getElementById("logout-btn");

const studentName = document.getElementById("student-name");
const form = document.getElementById("record-form");
const attendanceDate = document.getElementById("attendance-date");
const recordContent = document.getElementById("record-content");

const saveButton = document.getElementById("save-record");
const message = document.getElementById("record-message");

const backButton = document.getElementById("back-button");
const cancelButton = document.getElementById("cancel-button");

// ========================================
// ID DO ALUNO
// ========================================

const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get("student_id");

// ========================================
// INICIALIZAÇÃO
// ========================================

async function init() {
    try {
        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            window.location.href = "index.html";
            return;
        }

        if (!studentId) {
            alert("Aluno não informado.");
            window.location.href = "dashboard.html";
            return;
        }

        await loadProfile(user.id);

        const studentLoaded = await loadStudent();

        if (!studentLoaded) return;

        setTodayDate();

    } catch (error) {
        console.error("Erro ao iniciar prontuário:", error);
        showMessage(
            "Não foi possível carregar a página. Atualize e tente novamente.",
            "error"
        );
    }
}

// ========================================
// CARREGAR PROFISSIONAL
// ========================================

async function loadProfile(userId) {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("full_name, profession")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Erro ao carregar perfil:", error);
        userName.textContent = "Profissional";
        userRole.textContent = "";
        return;
    }

    userName.textContent = data.full_name || "Profissional";
    userRole.textContent = data.profession || "";
}

// ========================================
// CARREGAR ALUNO
// ========================================

async function loadStudent() {
    const { data, error } = await supabaseClient
        .from("students")
        .select("id, full_name")
        .eq("id", studentId)
        .single();

    if (error || !data) {
        console.error("Erro ao carregar aluno:", error);

        studentName.textContent = "Aluno não encontrado";
        saveButton.disabled = true;

        showMessage(
            "Não foi possível localizar esse aluno.",
            "error"
        );

        return false;
    }

    studentName.textContent = `Aluno: ${data.full_name}`;
    document.title = `Novo atendimento - ${data.full_name}`;

    return true;
}

// ========================================
// DATA ATUAL
// ========================================

function setTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    attendanceDate.value = `${year}-${month}-${day}`;
}

// ========================================
// SALVAR ATENDIMENTO
// ========================================

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    clearMessage();

    const date = attendanceDate.value;
    const content = recordContent.value.trim();

    if (!date) {
        showMessage("Informe a data do atendimento.", "error");
        return;
    }

    if (!content) {
        showMessage("Descreva o atendimento realizado.", "error");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";

    try {
        // Confirmar sessão
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            throw new Error(
                "Sua sessão expirou. Faça login novamente."
            );
        }

        // Inserir atendimento no banco
        const {
            data,
            error
        } = await supabaseClient
            .from("records")
            .insert({
                student_id: studentId,
                professional_id: user.id,
                attendance_date: date,
                content: content
            })
            .select()
            .single();

        if (error) {
            console.error("Erro do Supabase ao salvar:", error);

            throw new Error(
                "Erro ao salvar atendimento: " + error.message
            );
        }

        console.log("Atendimento salvo:", data);

        showMessage(
            "Atendimento salvo com sucesso!",
            "success"
        );

        // Voltar para a ficha do aluno
        setTimeout(function() {
            window.location.href = `aluno.html?id=${studentId}`;
        }, 700);

    } catch (error) {
        console.error("Erro ao salvar atendimento:", error);

        showMessage(
            error.message || "Ocorreu um erro ao salvar.",
            "error"
        );

        saveButton.disabled = false;
        saveButton.textContent = "Salvar atendimento";
    }
});

// ========================================
// VOLTAR / CANCELAR
// ========================================

function goBack() {
    window.location.href = `aluno.html?id=${studentId}`;
}

backButton.addEventListener("click", goBack);
cancelButton.addEventListener("click", goBack);

// ========================================
// SAIR DO SISTEMA
// ========================================

logoutButton.addEventListener("click", async function() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Erro ao sair:", error);
        showMessage("Não foi possível sair do sistema.", "error");
        return;
    }

    window.location.href = "index.html";
});

// ========================================
// MENSAGENS
// ========================================

function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
}

function clearMessage() {
    message.textContent = "";
    message.className = "form-message";
}

// ========================================
// INICIAR
// ========================================

init();
