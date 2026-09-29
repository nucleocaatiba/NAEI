// ========================================
// ALUNO - NAEI
// ========================================


// ========================================
// ELEMENTOS
// ========================================

const newStudentSection =
    document.getElementById("new-student-section");

const studentSection =
    document.getElementById("student-section");

const userName =
    document.getElementById("user-name");

const userRole =
    document.getElementById("user-role");

const logoutButton =
    document.getElementById("logout-btn");


// Cadastro
const form =
    document.getElementById("student-form");

const fullNameInput =
    document.getElementById("full-name");

const birthDateInput =
    document.getElementById("birth-date");

const diagnosisSelect =
    document.getElementById("diagnosis");

const diagnosisLevelInput =
    document.getElementById("diagnosis-level");

const notesInput =
    document.getElementById("student-notes");

const message =
    document.getElementById("form-message");

const saveButton =
    document.getElementById("save-student");


// Ficha
const studentName =
    document.getElementById("student-name");

const studentBirth =
    document.getElementById("student-birth");

const profileName =
    document.getElementById("profile-name");

const profileBirth =
    document.getElementById("profile-birth");

const studentAvatar =
    document.getElementById("student-avatar");

const diagnosesList =
    document.getElementById("diagnoses-list");

const recordsList =
    document.getElementById("records-list");

const newRecordButton =
    document.getElementById("new-record-btn");


// ========================================
// ID DO ALUNO
// ========================================

const urlParams =
    new URLSearchParams(window.location.search);

const studentId =
    urlParams.get("id");


// ========================================
// INICIALIZAÇÃO
// ========================================

async function init() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "index.html";

        return;
    }


    await loadProfile(user.id);


    // Se existe ID, estamos vendo um aluno
    if (studentId) {

        newStudentSection.style.display =
            "none";

        studentSection.style.display =
            "block";

        await loadStudent();

        return;
    }


    // Caso contrário, é cadastro
    newStudentSection.style.display =
        "block";

    studentSection.style.display =
        "none";

    await loadDiagnoses();

}


// ========================================
// PERFIL DO PROFISSIONAL
// ========================================

async function loadProfile(userId) {

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select(
                "full_name, profession"
            )
            .eq("id", userId)
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
// CARREGAR DIAGNÓSTICOS DISPONÍVEIS
// ========================================

async function loadDiagnoses() {

    const { data, error } =
        await supabaseClient
            .from("diagnoses")
            .select(
                "id, name"
            )
            .order(
                "name",
                { ascending: true }
            );


    if (error) {

        console.error(
            "Erro ao carregar diagnósticos:",
            error
        );

        return;
    }


    diagnosisSelect.innerHTML = `
        <option value="">
            Nenhum diagnóstico informado
        </option>
    `;


    data.forEach(diagnosis => {

        const option =
            document.createElement("option");

        option.value =
            diagnosis.id;

        option.textContent =
            diagnosis.name;

        diagnosisSelect.appendChild(option);

    });

}


// ========================================
// CADASTRAR ALUNO
// ========================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


        const fullName =
            fullNameInput.value.trim();

        const birthDate =
            birthDateInput.value || null;

        const notes =
            notesInput.value.trim() || null;

        const diagnosisId =
            diagnosisSelect.value || null;

        const diagnosisLevel =
            diagnosisLevelInput.value.trim() || null;


        if (!fullName) {

            showMessage(
                "Digite o nome completo do aluno.",
                "error"
            );

            return;
        }


        saveButton.disabled = true;

        saveButton.textContent =
            "Salvando...";


        try {

            // Criar aluno
            const {
                data: student,
                error: studentError
            } = await supabaseClient
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


            // Salvar diagnóstico
            if (diagnosisId) {

                const {
                    error: diagnosisError
                } = await supabaseClient
                    .from("student_diagnoses")
                    .insert({

                        student_id:
                            student.id,

                        diagnosis_id:
                            diagnosisId,

                        level:
                            diagnosisLevel

                    });


                if (diagnosisError) {

                    console.error(
                        "Erro ao salvar diagnóstico:",
                        diagnosisError
                    );

                    throw new Error(
                        "Aluno criado, mas houve um erro ao salvar o diagnóstico."
                    );
                }

            }


            showMessage(
                "Aluno cadastrado com sucesso!",
                "success"
            );


            setTimeout(
                function() {

                    window.location.href =
                        `aluno.html?id=${student.id}`;

                },
                700
            );


        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Ocorreu um erro ao salvar o aluno.",
                "error"
            );


            saveButton.disabled =
                false;

            saveButton.textContent =
                "Salvar aluno";

        }

    }
);


// ========================================
// CARREGAR FICHA DO ALUNO
// ========================================

async function loadStudent() {

    const {
        data: student,
        error
    } = await supabaseClient
        .from("students")
        .select(`
            id,
            full_name,
            birth_date,
            notes
        `)
        .eq("id", studentId)
        .single();


    if (error || !student) {

        console.error(
            "Erro ao carregar aluno:",
            error
        );

        studentName.textContent =
            "Aluno não encontrado";

        studentBirth.textContent =
            "";

        return;
    }


    document.title =
        `${student.full_name} - NAEI`;


    studentName.textContent =
        student.full_name;


    profileName.textContent =
        student.full_name;


    const birth =
        formatDate(student.birth_date);


    studentBirth.textContent =
        birth ?
        `Nascimento: ${birth}` :
        "Data de nascimento não informada";


    profileBirth.textContent =
        birth ?
        `Nascimento: ${birth}` :
        "Data de nascimento não informada";


    studentAvatar.textContent =
        student.full_name
            .trim()
            .charAt(0)
            .toUpperCase();


    await loadStudentDiagnoses();

    await loadRecords();

}


// ========================================
// DIAGNÓSTICOS DO ALUNO
// ========================================

async function loadStudentDiagnoses() {

    const {
        data,
        error
    } = await supabaseClient
        .from("student_diagnoses")
        .select(`
            id,
            level,
            notes,
            diagnoses (
                name,
                description
            )
        `)
        .eq(
            "student_id",
            studentId
        );


    if (error) {

        console.error(
            "Erro ao carregar diagnósticos:",
            error
        );

        diagnosesList.innerHTML = `
            <div class="loading-message">
                Não foi possível carregar os diagnósticos.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        diagnosesList.innerHTML = `
            <div class="empty-message">
                Nenhum diagnóstico informado.
            </div>
        `;

        return;
    }


    diagnosesList.innerHTML = "";


    data.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "diagnosis-card";


        const name =
            item.diagnoses?.name ||
            "Diagnóstico";


        let details = "";


        if (item.level) {

            details +=
                `<strong>${escapeHtml(item.level)}</strong>`;

        }


        if (item.notes) {

            details +=
                `<span>${escapeHtml(item.notes)}</span>`;

        }


        card.innerHTML = `

            <div class="diagnosis-icon">
                +
            </div>

            <div>

                <h3>
                    ${escapeHtml(name)}
                </h3>

                ${
                    details
                    ? `<p>${details}</p>`
                    : ""
                }

            </div>

        `;


        diagnosesList.appendChild(card);

    });

}


// ========================================
// CARREGAR PRONTUÁRIOS
// ========================================

async function loadRecords() {

    recordsList.innerHTML = `
        <div class="loading-message">
            Carregando histórico...
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("records")
        .select(`
            id,
            attendance_date,
            type,
            content,
            observations,
            recommendations,
            professional_id,
            profiles (
                full_name,
                profession
            )
        `)
        .eq(
            "student_id",
            studentId
        )
        .order(
            "attendance_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Erro ao carregar prontuários:",
            error
        );

        recordsList.innerHTML = `
            <div class="empty-message">
                Não foi possível carregar o histórico.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        recordsList.innerHTML = `
            <div class="empty-message">
                Ainda não existem atendimentos registrados.
            </div>
        `;

        return;
    }


    recordsList.innerHTML = "";


    data.forEach(record => {

        const card =
            document.createElement("article");

        card.className =
            "record-card";


        const professional =
            record.profiles?.full_name ||
            "Profissional";


        const profession =
            record.profiles?.profession ||
            "";


        const date =
            formatDate(
                record.attendance_date
            );


        card.innerHTML = `

            <div class="record-header">

                <div>

                    <div class="record-date">
                        ${date}
                    </div>

                    <h3>
                        ${
                            escapeHtml(
                                record.type ||
                                "Atendimento"
                            )
                        }
                    </h3>

                </div>

                <div class="record-professional">

                    <strong>
                        ${escapeHtml(professional)}
                    </strong>

                    <span>
                        ${escapeHtml(profession)}
                    </span>

                </div>

            </div>


            <div class="record-content">

                <div class="record-field">

                    <strong>
                        Registro
                    </strong>

                    <p>
                        ${escapeHtml(
                            record.content || ""
                        )}
                    </p>

                </div>


                ${
                    record.observations
                    ? `
                    <div class="record-field">

                        <strong>
                            Observações
                        </strong>

                        <p>
                            ${escapeHtml(
                                record.observations
                            )}
                        </p>

                    </div>
                    `
                    : ""
                }


                ${
                    record.recommendations
                    ? `
                    <div class="record-field">

                        <strong>
                            Recomendações
                        </strong>

                        <p>
                            ${escapeHtml(
                                record.recommendations
                            )}
                        </p>

                    </div>
                    `
                    : ""
                }

            </div>

        `;


        recordsList.appendChild(card);

    });

}


// ========================================
// NOVO ATENDIMENTO
// ========================================

if (newRecordButton) {

    newRecordButton.addEventListener(
        "click",
        function() {

            window.location.href =
                `prontuario.html?student_id=${studentId}`;

        }
    );

}


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

function showMessage(text, type) {

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
// FORMATAR DATA
// ========================================

function formatDate(date) {

    if (!date) {
        return "";
    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


// ========================================
// SEGURANÇA
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


// ========================================
// INICIAR
// ========================================

init();
