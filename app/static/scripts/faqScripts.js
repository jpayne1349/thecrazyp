
let questions = document.getElementsByClassName('faq_question');

for( let question of questions) {

    question.addEventListener('click', togglePreviousSibling);

}


function togglePreviousSibling() {
    let hat_grow_time;

    let hat_sibling = this.previousElementSibling;

    if( hat_sibling.classList.contains('show')) {
        hat_grow_time = 0;
    } else {
        hat_grow_time = 700;
    }

    hat_sibling.classList.toggle('show');

    setTimeout(()=>{
        let answer_text = hat_sibling.firstElementChild;
        answer_text.classList.toggle('show');
    }, hat_grow_time);
}