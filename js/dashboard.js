// ========================================
// DASHBOARD - NAEI
// ========================================


// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const studentsGrid = document.getElementById("students-grid");
const searchInput = document.getElementById("search-student");
const userName = document.getElementById("user-name");
const userRole = document.getElementById("user-role");
const logoutButton = document.getElementById("logout-btn");
const newStudentButton = document.getElementById("new-student-btn");


// ========================================
// BOTÃO NOVO ALUNO
// ========================================

if (newStudentButton) {

    newStudentButton.addEventListener("click", function () {

        window.location.href = "aluno.html";

    });

}


// ========================================
// GUARDA TODOS OS ALUNOS CARREGADOS
// ========================================

let students = [];


// ========================================
// INICIALIZAÇÃO
// ========================================

async function initDashboard() {

    const {
        data: { user },
        error: sessionError
    } = await supabaseClient.auth.getUser();


    // Usuário não está logado
    if (sessionError || !user) {

        window.location.href = "index.html";

        return;
    }


    // Carrega perfil
    await loadProfile(user.id);


    // Carrega alunos
    await loadStudents();

}


// ========================================
// CARREGAR PERFIL
// ========================================

async function loadProfile(userId) {

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("full_name, profession")
        .eq("id", userId)
        .single();


    if (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        userName.textContent = "Profissional";
        userRole.textContent = "";

        return;
    }


    userName.textContent = data.full_name;
    userRole.textContent = data.profession;

}


// ========================================
// CARREGAR ALUNOS
// ========================================

async function loadStudents() {

    studentsGrid.innerHTML = `
        <div class="loading-message">
            Carregando alunos...
        </div>
    `;


    const { data, error } = await supabaseClient
        .from("students")
        .select(`
            id,
            full_name,
            birth_date,
            student_diagnoses (
                level,
                notes,
                diagnoses (
                    name
                )
            )
        `)
        .eq("active", true)
        .order("full_name", {
            ascending: true
        });


    if (error) {

        console.error(
            "Erro ao carregar alunos:",
            error
        );

        studentsGrid.innerHTML = `
            <div class="loading-message">
                Não foi possível carregar os alunos.
            </div>
        `;

        return;
    }


    students = data || [];

    renderStudents(students);

}


// ========================================
// MOSTRAR ALUNOS
// ========================================

function renderStudents(list) {

    studentsGrid.innerHTML = "";


    if (list.length === 0) {

        studentsGrid.innerHTML = `
            <div class="loading-message">
                Nenhum aluno encontrado.
            </div>
        `;

        return;
    }


    list.forEach(student => {

        const card = createStudentCard(student);

        studentsGrid.appendChild(card);

    });

}


// ========================================
// CRIAR CARD DO ALUNO
// ========================================

function createStudentCard(student) {

    const card = document.createElement("div");

    card.className = "student-card";


    const initial = student.full_name
        .trim()
        .charAt(0)
        .toUpperCase();


    let diagnosisText =
        "Sem diagnóstico informado";


    if (
        student.student_diagnoses &&
        student.student_diagnoses.length > 0
    ) {

        diagnosisText = student.student_diagnoses
            .map(item => {

                let diagnosis =
                    item.diagnoses?.name || "";

                if (item.level) {

                    diagnosis +=
                        ` - ${item.level}`;

                }

                return diagnosis;

            })
            .filter(Boolean)
            .join(" • ");

    }


    card.innerHTML = `

        <div class="student-avatar">
            ${escapeHtml(initial)}
        </div>

        <div class="student-info">

            <h3>
                ${escapeHtml(student.full_name)}
            </h3>

            <p>
                ${escapeHtml(diagnosisText)}
            </p>

        </div>

    `;


    // Abre a ficha do aluno
    card.addEventListener(
        "click",
        function () {

            window.location.href =
                `aluno.html?id=${student.id}`;

        }
    );


    return card;

}


// ========================================
// BUSCA DE ALUNOS
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderStudents(students);

                return;
            }


            const filtered =
                students.filter(student =>
                    student.full_name
                        .toLowerCase()
                        .includes(search)
                );


            renderStudents(filtered);

        }
    );

}


// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

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

}


// ========================================
// SEGURANÇA PARA TEXTOS
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// INICIAR DASHBOARD
// ========================================

initDashboard();
