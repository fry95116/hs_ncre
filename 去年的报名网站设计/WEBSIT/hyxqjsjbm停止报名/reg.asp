<!--#include file="conn.asp"-->
<!--#include file="const.asp"-->
<!--<%
'Response.Buffer = True 
'Response.ExpiresAbsolute = Now() - 1 
'Response.Expires = 1 
'Response.CacheControl = "no-cache" 
'If len(Session("FirstTimeToPage")) > 0 then 
'' �û��Ѿ����ʹ���ǰҳ�棬�������ٴη��ط��ʡ� 
'' ����Ự���������û��ض��򵽵�¼ҳ�档 
'Session("FirstTimeToPage") = "" 
'Response.Redirect "logout.asp" 
'Response.End 
'End If 
'' ����������е����˵���û��ܹ��鿴��ǰҳ�� 
'' ���¿�ʼ������ 
'%> -->
<html>
<head>
<title>ȫ��������ȼ��������ϱ���ϵͳ</title>
<meta http-equiv="content-type" content="text/html;charset=gb2312">
<meta http-equiv="Content-Language" content="zh-cn">
<meta name="Description" content="ȫ��������ȼ�����,���ϱ���ϵͳ">
<meta name="Keywords" content="ȫ��������ȼ�����,���ϱ���ϵͳ">
<script language="JavaScript">
function zdsc()
{
var getsf=document.form1.sfzh.value;
if (getsf.length==15)
{
  document.form1.zdsccsrq.value="19"+getsf.substring(6,12);
  document.form1.zdsccsrq.focus()
  return false
  }
else if (getsf.length==18)
{
  document.form1.zdsccsrq.value=getsf.substring(6,14);
  document.form1.zdsccsrq.focus()
  return false
  }
}
</script>
<script language="javascript" src="checkdata.js" type="text/javascript"></script>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<link href="mycss.css" rel="stylesheet" type="text/css">
</head>
<body bgcolor="#ffdd6d">
<!--#include file="header.html"-->
<form method="POST" name="form1" language="javascript" onSubmit="return Validator.Validate(this,2)" action="submit.asp" >
<table width="778"><tr><td></td>���<span class="style4">**</span>��Ϊ�����������������ȷѡ�����ɼ������࣬����ȷ��д�ϴ�ԭ׼��֤�ţ�</tr></table>
    <TABLE borderColor=#ffffff cellSpacing=0 cellPadding=4 width="778" align=center border=1>
      <TBODY><tr><td colspan="4""></td></tr>
        <TR>
          <TD width="90" bgColor=#f0f0f0>�����������ԣ�</span>
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
          <%dim rsr1,sqlr1
set rsr1=Server.CreateObject("Adodb.Recordset")
sqlr1="select * from tc_jbyy where kkbj=true"
rsr1.open sqlr1,conn,1,1
%><span class="style3">**</span>
          <select  size=1 name=jbyydm  dataType="Require"  msg="δѡ�񱨿���������" >
		  <option value="">ѡ�񱨿���������</option>
		  <%do while not RSr1.eof %>				  
            <option value="<%=rsr1("jbyydm")%>"><%=rsr1("jbyydm")%>-<%=rsr1("jbyy")%></option>
			<%rsr1.movenext
loop
rsr1.close
set rsr1=nothing%>
          </select> 
          ����������ȷ�ı����������ࣩ </span>
        <TR>
          <TD><span class="tdc">����</span>��
          <TD width="295"><span class="style3">**</span>
              <input type="text" name="rname" size="15" maxlength="15" class="form" dataType="Chinese" msg="����ֻ��������">
          <TD width="72"> <span class="tdc">�Ա�</span>��
          <TD width="263"> <span class="style3">**</span>                    <input type="radio" value="1"  dataType="Group"  msg="�㻹û��ѡ���Ա�"  name="sex">
��&nbsp;
<input type="radio" value="2" name="sex">
Ů                  
        <TR>
          <TD bgColor=#f0f0f0>���壺        
          <TD colspan="3" bgColor=#f0f0f0>		
		  <%dim rsr0,sqlr0
set rsr0=Server.CreateObject("Adodb.Recordset")
sqlr0="select * from tc_mz"
rsr0.open sqlr0,conn,1,1
%><span class="style3">**</span>
            <select   size=1 name=mz   dataType="Require"  msg="δѡ������" >
		<option value="" selected>ѡ����������</option>
				   <%do while not RSr0.eof %>
               <option value="<%=rsr0("mz")%>"><%=rsr0("mz")%>-<%=rsr0("mzmc")%></option>
		  	   <%rsr0.movenext
loop
rsr0.close
set rsr0=nothing%> </select>
        <TR>
          <TD bgColor=#f0f0f0>���֤�ţ�        
          <TD bgColor=#f0f0f0> <p><span class="style3">**</span>            
              <input name="sfzh" type="text" class="form" onBlur="zdsc()" size="20" maxlength="18" dataType="IdCard" msg="���֤�Ŵ���">
              <span class="tdc">(15��18λ,����X,���д)</span>            
              </p>
          <TD bgColor=#f0f0f0>�������ڣ�
          <TD bgColor=#f0f0f0><label></label>                   
              <p>
                <label>
                <span class="style3">**</span>
                <input name="zdsccsrq" type="text" size="9" maxlength="8" readonly="true" >
                </label>
            (�磺19820101)</p>
        <TR>
            <TD bgColor=#f0f0f0>ְҵ��
            <TD colspan="3" bgColor=#f0f0f0> <span class="tdc">
<%dim rsr3,sqlr3
set rsr3=Server.CreateObject("Adodb.Recordset")
sqlr3="select * from tc_zy"
rsr3.open sqlr3,conn,1,1
%><span class="style3">**</span>
<SELECT class=form id=zy size=1 name=zy>
<%do while not RSr3.eof %>
<option value="<%=rsr3("zy")%>" <%if rsr3("zy")="30" then%> selected <%end if%>><%=rsr3("zy")%>-<%=rsr3("zymc")%></option>
<%rsr3.movenext
loop
rsr3.close
set rsr3=nothing%></SELECT>
</span>             
        <TR>
            <TD bgColor=#f0f0f0>�Ļ��̶ȣ�          
            <TD colspan="3" bgColor=#f0f0f0> 
<%dim rsr2,sqlr2
set rsr2=Server.CreateObject("Adodb.Recordset")
sqlr2="select * from tc_whcd"
rsr2.open sqlr2,conn,1,1
%><span class="style3">**</span>
          <SELECT class=form id=select size=1 name=whcd>
<%do while not RSr2.eof %>
<option value="<%=rsr2("whcd")%>" <%if rsr2("whcd")="3" then%> selected <%end if%>><%=rsr2("whcd")%>-<%=rsr2("whcdmc")%></option>
<%rsr2.movenext
loop
rsr2.close
set rsr2=nothing%></SELECT>
          </span>                   
        <TR>
          <TD>�����ɼ�����        
                    
          ��
          <TD> <span class="tdc">
                                                      <span class="style3"> </span>
<%dim rsr4,sqlr4
set rsr4=Server.CreateObject("Adodb.Recordset")
sqlr4="select * from tc_blcj"
rsr4.open sqlr4,conn,1,1
%><span class="style3">**</span>
<select name=blcjzl size=1 class=form id=blcjzl>
<%do while not RSr4.eof %><option value="<%=rsr4("blcj")%>" <%if rsr4("blcj")="0" then%> selected <%end if%>><%=rsr4("blcj")%>-<%=rsr4("blcjmc")%></option>
<%rsr4.movenext
loop
rsr4.close
set rsr4=Nothing
conn.close
Set conn=nothing%></select>            
            (��������<span class="STYLE6">����</span>ѡ�������ֳɼ�)</span>             
          <TD>ԭ׼��֤�ţ�          
          <TD><p class="tdc">
              <input name="yzkzh" type="text" class="form" size="20" maxlength="20"  style="ime-mode: disabled;">
              (��������<span class="STYLE6">����</span>��д)           </p>
        <TR>
            <TD bgColor=#f0f0f0><p> ѧ�Ż��ַ</p>
            <TD bgColor=#f0f0f0><span class="style3">**</span>
                <input name="addr1" type="text" class="form" size="20" maxlength="20"  dataType="LimitB" min="9" max="20"  msg="ѧ��ӦΪ9λ����У������ַ����ԼΪ5-10������">
                <span class="tdc"><br>
                (��Уȫ���Ʊ�ר��ѧ��������9λѧ�ţ�<br>
                ������������д��ʵ����ϵ��ַ��������5-10��Ϊ�ˣ�</span>
            <TD bgColor=#f0f0f0>��ϵ�绰��
            <TD bgColor=#f0f0f0>   <input type="text" name="tel1" size="20" maxlength="20" class="form"  style="ime-mode: disabled;">
        <TR>
            <TD bgColor=#f0f0f0>          
            <TD colspan="3" bgColor=#f0f0f0>          
      </TBODY>
    </TABLE>
    <p>
      <input type="submit" value="�ύ��Ϣ" name="B3" class="form">
&nbsp;
<input type="reset" value="��������" name="B3" class="form">
&nbsp;
    <input name="Submit" type="button" onMouseDown="javascript:window.close()" value="�رմ���" class="form">
     </p>
  </form>  
<!--#include file="footer.html"--> 
</body>  
  
</html>  
