// ========================================
// PRONTUÁRIO - NAEI
// ========================================


// ========================================
// ELEMENTOS
// ========================================

const userName =
    document.getElementById("user-name");

const userRole =
    document.getElementById("user-role");

const logoutButton =
    document.getElementById("logout-btn");

const studentName =
    document.getElementById("student-name");

const form =
    document.getElementById("record-form");

const attendanceDate =
    document.getElementById("attendance-date");

const recordType =
    document.getElementById("record-type");

const recordContent =
    document.getElementById("record-content");

const recordObservations =
    document.getElementById("record-observations");

const recordRecommendations =
    document.getElementById("record-recommendations");

const saveButton =
    document.getElementById("save-record");

const message =
    document.getElementById("record-message");

const backButton =
    document.getElementById("back-button");

const cancelButton =
    document.getElementById("cancel-button");


// ========================================
// PEGAR ID DO ALUNO
// ========================================

const urlParams =
    new URLSearchParams(window.location.search);

const studentId =
    urlParams.get("student_id");


// ========================================
// INICIALIZAÇÃO
// ========================================

async function init() {

    // Verifica usuário logado

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "index.html";

        return;
    }


    // Precisamos ter um aluno

    if (!studentId) {

        alert(
            "Aluno não informado."
        );

        window.location.href =
            "dashboard.html";

        return;
    }


    // Carrega profissional

    await loadProfile(user.id);


    // Carrega aluno

    await loadStudent();


    // Define data de hoje

    setTodayDate();

}


// ========================================
// CARREGAR PROFISSIONAL
// ========================================

async function loadProfile(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select(
            "full_name, profession"
        )
        .eq(
            "id",
            userId
        )
        .single();


    if (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        userName.textContent =
            "Profissional";

        userRole.textContent =
            "";

        return;
    }


    userName.textContent =
        data.full_name;

    userRole.textContent =
        data.profession;

}


// ========================================
// CARREGAR ALUNO
// ========================================

async function loadStudent() {

    const {
        data,
        error
    } = await supabaseClient
        .from("students")
        .select(
            "id, full_name"
        )
        .eq(
            "id",
            studentId
        )
        .single();


    if (error || !data) {

        console.error(
            "Erro ao carregar aluno:",
            error
        );

        studentName.textContent =
            "Aluno não encontrado";

        saveButton.disabled =
            true;

        return;
    }


    studentName.textContent =
        `Aluno: ${data.full_name}`;

    document.title =
        `Novo atendimento - ${data.full_name}`;

}


// ========================================
// DATA DE HOJE
// ========================================

function setTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    attendanceDate.value =
        `${year}-${month}-${day}`;

}


// ========================================
// SALVAR ATENDIMENTO
// ========================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


        const date =
            attendanceDate.value;

        const type =
            recordType.value;

        const content =
            recordContent.value.trim();

        const observations =
            recordObservations.value.trim();

        const recommendations =
            recordRecommendations.value.trim();


        // Validações

        if (!date) {

            showMessage(
                "Informe a data do atendimento.",
                "error"
            );

            return;
        }


        if (!type) {

            showMessage(
                "Selecione o tipo de atendimento.",
                "error"
            );

            return;
        }


        if (!content) {

            showMessage(
                "Descreva o atendimento realizado.",
                "error"
            );

            return;
        }


        saveButton.disabled =
            true;

        saveButton.textContent =
            "Salvando...";


        try {

            // Pega usuário atual

            const {
                data: { user },
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (userError || !user) {

                throw new Error(
                    "Sua sessão expirou. Faça login novamente."
                );

            }


            // ========================================
            // SALVAR NO SUPABASE
            // ========================================

            const {
                data,
                error
            } = await supabaseClient
                .from("records")
                .insert({

                    student_id:
                        studentId,

                    professional_id:
                        user.id,

                    attendance_date:
                        date,

                    type:
                        type,

                    content:
                        content,

                    observations:
                        observations || null,

                    recommendations:
                        recommendations || null

                })
                .select()
                .single();


            if (error) {

                console.error(
                    "Erro ao salvar atendimento:",
                    error
                );

                throw new Error(
                    "Não foi possível salvar o atendimento."
                );
            }


            console.log(
                "Atendimento salvo:",
                data
            );


            showMessage(
                "Atendimento salvo com sucesso!",
                "success"
            );


            // Volta para ficha

            setTimeout(
                function() {

                    window.location.href =
                        `aluno.html?id=${studentId}`;

                },
                700
            );


        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Ocorreu um erro ao salvar.",
                "error"
            );


            saveButton.disabled =
                false;

            saveButton.textContent =
                "Salvar atendimento";

        }

    }
);


// ========================================
// VOLTAR
// ========================================

function goBack() {

    window.location.href =
        `aluno.html?id=${studentId}`;

}


backButton.addEventListener(
    "click",
    goBack
);


cancelButton.addEventListener(
    "click",
    goBack
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async function() {

        const { error } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Erro ao sair:",
                error
            );

            return;
        }


        window.location.href =
            "index.html";

    }
);


// ========================================
// MENSAGENS
// ========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        `form-message ${type}`;

}


function clearMessage() {

    message.textContent =
        "";

    message.className =
        "form-message";

}


// ========================================
// INICIAR
// ========================================

init();
