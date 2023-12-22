<a href="https://aiemploye.com">![AI Employe](https://res.cloudinary.com/dgxzz0bav/image/upload/v1703117939/Frame_15_jbcql5.png)</a>

## AI Employe

AI Employe is first-ever reliable browser automation
to gain hours back every week. Effortlessly automate email-to-CRM/ERP data transfers and e2e testing. Automate tasks requiring human-like intelligence: understanding emails, receipts, invoices, etc.

Buy the AI Employee License in an exclusive deal: https://aiemploye.com/ltdpricing

## Comparison with Adept.ai

<div>
    <a href="https://www.loom.com/share/27d1f8983572429a8a08efdb2c336fe8">
      <p>Comparison: Adept.ai vs AI Employe - Watch Video (loom.com/share/27d1f8983572429a8a08efdb2c336fe8)</p>
    </a>
    <a href="https://www.loom.com/share/27d1f8983572429a8a08efdb2c336fe8">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/27d1f8983572429a8a08efdb2c336fe8-with-play.gif">
    </a>
</div>

## Install

Our stack consists of Next.js, Rust, Postgres, MeiliSearch, and Firebase auth for authentication. Please sign up for a Firebase account and create a project. Then, ensure you install the dependencies before starting the app.

- Copy the the .env.sample file to .env.production or .env.development
- Fill the .env file with your credentials
- Run `npm install`
- Run `npm run db:deploy`
- Run `npm run dev` (for development)
- Run `npm run build` (for production)
- Run `npm run start` (for production)

Once you have run 'dev' or 'build', you will find the extension built inside the `./client/extension/build` folder. You can then load this folder as an unpacked extension in your browser.

## How it Works

There are several problems with current browser agents. Here, we explain the problems and how we have solved them.

### Problem 1: Finding the Right Element

There are several techniques for this, ranging from sending a shortened form of HTML to GPT-3, creating a bounding box with IDs and sending it to GPT-4-vision to take actions, or directly asking GPT-4-vision to obtain the X and Y coordinates of the element. However, none of these methods were reliable; they all led to hallucinations.

To address this, we developed a new technique where we [index](https://github.com/vignshwarar/AI-Employe/blob/db530101c9fd9a0f0d7ce3eeac033e70cb172541/server/src/common/dom/search.rs#L9) the entire DOM in MeiliSearch, allowing GPT-4-vision to generate commands for which element's inner text to click, copy, or perform other actions. We then [search](https://github.com/vignshwarar/AI-Employe/blob/db530101c9fd9a0f0d7ce3eeac033e70cb172541/server/src/common/dom/search.rs#L46) the index with the generated text and retrieve the element ID to send back to the browser to take action. There are a few limitations here, but we have implemented some techniques to overcome them, such as dealing with the same text in multiple elements or clicking on an icon (we are still working on this).

### Problem 2: GPT Derailing from Workflow

To prevent GPT from derailing from tasks, we use a technique that is akin to retrieval-augmented generation, but we kind of call it Actions Augmented Generation. Essentially, when a user creates a workflow, we don't record the screen, microphone, or camera, but we do record the DOM element changes for every action (clicking, typing, etc.) the user takes. We then use the workflow title, objective, and recorded actions to generate a set of tasks. Whenever we execute a task, we embed all the actions the user took on that particular domain with the prompt. This way, GPT stays on track with the task, even if the user has not provided a very brief title and objective; their actions will guide GPT to complete the task.

## Roadmap

- [x] Workflows
- [x] Chat with what you see
- [ ] Community shared workflows
- [ ] Cloud version of AI Employe
- [ ] Control browser by text
- [ ] Control browser by voice
- [ ] more to come...
