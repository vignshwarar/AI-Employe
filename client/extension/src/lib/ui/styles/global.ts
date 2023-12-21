import { createGlobalStyle } from "styled-components";

export const colors = {
  background: "#ECECEC",
  blueBackground: "rgba(29, 133, 255, 0.09)",
  blueBackgroundHover: "rgba(29, 133, 255, 0.2)",
  blue: "#1d85ff",
  grey: "#E5E8E8",
  lightGrey: "#F2F4F4",
  strongGrey: "#707070",
};

export const GlobalStyle = createGlobalStyle`
  html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
  background: ${colors.background};
  padding:0;
  margin:0;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}
button, input, select, textarea {
  font-family: 'Poppins', sans-serif;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
`;
