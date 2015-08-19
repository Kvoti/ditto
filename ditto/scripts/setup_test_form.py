from users.models import User
from formbuilder import models, renderer

def run()
    models.Form.objects.all().delete()

    form = models.Form.objects.create_form(
        slug='test',
        title='test form',
        questions=[
            models.Form.text(
                question="What is your favourite colour"
            ),
            models.Form.choice(
                question="Which f/e framework do you prefer",
                options=[
                    "React",
                    "Angular",
                    "Ember",
                ]
            ),
            models.Form.score_group(
                question="Please rate how you feel about the following",
                labels=[
                    "Disagree",
                    "No opinion",
                    "Agree"
                ],
                items=[
                    "React is cool",
                    "Coding is fun",
                    "Client coding is hard",
                ],
            )
        ]
    )

    print renderer.render_form(form)


    response = form.submit_response(
        User.objects.get(username="mark"),
        [
            "blue",
            "React",
            [
                "Agree",
                "No opinion",
                "Agree"
            ]
        ]
    )
    print renderer.render_response(response)
