const form = document.getElementById("student-form");

const fullNameInput = document.getElementById("full-name");
const birthDateInput = document.getElementById("birth-date");
const diagnosisSelect = document.getElementById("diagnosis");
const diagnosisLevelInput = document.getElementById("diagnosis-level");
const notesInput = document.getElementById("student-notes");

const message = document.getElementById("form-message");
const saveButton = document.getElementById("save-student");

const userName = document.getElementById("user-name");
const userRole = document.getElementById("user-role");
const logoutButton = document.getElementById("logout-btn");


async function init() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {

        window.location.href = "index.html";

        return;
    }

    await loadProfile(user.id);

    await loadDiagnoses();

}


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

    userName.textContent = data.full_name;
    userRole.textContent = data.profession;

}


async function loadDiagnoses() {

    const { data, error } = await supabaseClient
        .from("diagnoses")
        .select("id, name")
        .order("name", { ascending: true });

    if (error) {

        console.error("Erro ao carregar diagnósticos:", error);

        return;
    }

    diagnosisSelect.innerHTML = `
        <option value="">
            Nenhum diagnóstico informado
        </option>
    `;

    data.forEach(diagnosis => {

        const option = document.createElement("option");

        option.value = diagnosis.id;

        option.textContent = diagnosis.name;

        diagnosisSelect.appendChild(option);

    });

}


form.addEventListener("submit", async function(event) {

    event.preventDefault();

    clearMessage();

    const fullName = fullNameInput.value.trim();
    const birthDate = birthDateInput.value || null;
    const notes = notesInput.value.trim() || null;

    const diagnosisId = diagnosisSelect.value || null;
    const diagnosisLevel = diagnosisLevelInput.value.trim() || null;


    if (!fullName) {

        showMessage(
            "Digite o nome completo do aluno.",
            "error"
        );

        return;
    }


    saveButton.disabled = true;

    saveButton.textContent = "Salvando...";


    try {

        /*
         * 1. Criar aluno
         */

        const { data: student, error: studentError } =
            await supabaseClient
                .from("students")
                .insert({
                    full_name: fullName,
                    birth_date: birthDate,
                    notes: notes
                })
                .select()
                .single();


        if (studentError) {

            console.error(
                "Erro ao cadastrar aluno:",
                studentError
            );

            throw new Error(
                "Não foi possível cadastrar o aluno."
            );
        }


        /*
         * 2. Se houver diagnóstico,
         * criar vínculo com o aluno
         */

        if (diagnosisId) {

            const { error: diagnosisError } =
                await supabaseClient
                    .from("student_diagnoses")
                    .insert({

                        student_id: student.id,

                        diagnosis_id: diagnosisId,

                        level: diagnosisLevel

                    });


            if (diagnosisError) {

                console.error(
                    "Erro ao salvar diagnóstico:",
                    diagnosisError
                );

                throw new Error(
                    "Aluno criado, mas não foi possível salvar o diagnóstico."
                );
            }

        }


        showMessage(
            "Aluno cadastrado com sucesso!",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                `aluno.html?id=${student.id}`;

        }, 700);


    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Ocorreu um erro ao salvar o aluno.",
            "error"
        );


        saveButton.disabled = false;

        saveButton.textContent = "Salvar aluno";

    }

});


function showMessage(text, type) {

    message.textContent = text;

    message.className =
        `form-message ${type}`;

}


function clearMessage() {

    message.textContent = "";

    message.className = "form-message";

}


logoutButton.addEventListener("click", async function() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        console.error(
            "Erro ao sair:",
            error
        );

        return;
    }

    window.location.href = "index.html";

});


init();
