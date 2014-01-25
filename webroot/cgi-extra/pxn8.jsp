<%
// ------------------------------------------------------------------------
// A Java / JSP wrapper around pxn8.pl for those App Servers which
//	don't support CGI
// ------------------------------------------------------------------------

// 
// CHANGE THIS PATH TO YOUR OWN ABSOLUTE PATH TO pxn8.pl !
//
//
// A typical Sun App Server Install
//String script = "c:\\Sun\\AppServer\\domains\\domain1\\docroot\\pixenate\\pxn8.pl";

// A typical Tomcat Install
//String script = "c:\\Tomcat6\\webapps\\ROOT\\pixenate\\pxn8.pl";

// 
// CHANGE THIS PATH TO YOUR OWN ABSOLUTE PATH TO perl.exe !
//
String perlExe = "c:\\usr\\bin\\perl.exe";

// ------------------------------------------------------------------------
Runtime r = Runtime.getRuntime();
String[] command = new String[]{perlExe ,script, "x"};

Process p = r.exec(command);

java.io.OutputStream pout = p.getOutputStream();
java.io.PrintWriter pw = new java.io.PrintWriter(pout);
String jsonRequest = request.getParameter("script");
pw.println(jsonRequest);
pw.close();

java.io.InputStream pin = p.getInputStream();
java.io.InputStreamReader cin = new java.io.InputStreamReader(pin);
java.io.BufferedReader in = new java.io.BufferedReader(cin);
String line = null;
//
// ignore 1st 2 lines (response headers)
//
line = in.readLine();
line = in.readLine();

while ((line = in.readLine()) != null){
	out.println(line);
}
int x = p.waitFor();
%>
