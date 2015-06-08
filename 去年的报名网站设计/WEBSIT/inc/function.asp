<%
'' ============================================================================================
'' 项目名称：查询班级报名情况
'' 项目版本：V1.0
'' 项目描述：按班级查询报名情况
'' 文件名称：inc/function.asp
'' 文件描述：ASP通用函数库
'' 公司名称：教务处
'' 开发人员：李大侠
'' 创建日期：2010-12-4 16:44:24
'' 修订日期：2010-12-04 04:53:53
'' 版权信息：Copyright (C) 2010

'' 项目升级时需读取以下生成工具的版权信息
'' 生成工具：风越代码生成器 [FireCode Creator]
'' 当前版本：通用版 V3.5
'' 官方网站：http://www.sino8848.com
'' ============================================================================================

Sub CheckError()
    If Err.number <> 0 Then
        Response.Write ("错误编号 (Error No)："&Err.number&"<br>")
        Response.Write ("错误信息 (Description)："&Err.description&"<br>")
        Response.Write ("错 误 源 (Source)："&Err.source&"<br>")
        Response.Write ("<b>本错误检测用于程序的开发、测试过程，如您不希望看到，可在发布时取消本页中CheckError()的调用。</b>")
    End If
End Sub


Sub ShowInfo(strInfo)
%>
<table border="0" cellspacing="0" cellpadding="0" align="center">
  <tr>
    <td bgcolor="#000000"><table border="0" align="center" cellpadding="5" cellspacing="1">
        <tr>
          <td align="center" bgcolor="#eeeeee">提示：</td>
        </tr>
        <tr>
          <td bgcolor="#FFFFFF"><table width="100%" border="0" cellspacing="10" cellpadding="0">
              <tr>
                <td><%=strInfo%></td>
              </tr>
            </table>

          </td>
        </tr>
        <tr>
          <td bgcolor="#eeeeee"> </td>
        </tr>
      </table></td>
  </tr>
</table>
<%
End Sub

Sub showPage(currentPage,totalPages,maxPerPage,totalRecord,showNextN)
    Response.Write ("<table border='0' cellpadding='5' cellspacing='0' align='center'><tr><td align='center'>")
    Response.Write ("共"&totalRecord&"条 每页<INPUT NAME=""setMaxPerPage"" TYPE=""input"" VALUE="""&maxPerPage&""" size=""3""  onkeyup=""document.all.maxPerPage.value=this.value;"">条 "&currentPage&"/"&totalPages&"页 "&setPageLink("首页",currentPage,totalPages)&setPageLink("上页",currentPage,totalPages)&setPageLink("下页",currentPage,totalPages)&setPageLink("尾页",currentPage,totalPages))
    Response.Write ("<input name=""setPage"" size=""4"" value="""&currentPage&""" onkeyup=""document.all.page.value=this.value;""> <input type=""submit"" name=""btn_go"" value=""翻页""><br>")

    If (totalRecord>0 And totalPages>3 And showNextN=true) Then
        Dim thisPageName
        thisPageName = currentAspFileFullName()

        Dim N,j,k,l,m
        N = 10
        j = currentPage
        While (j Mod N) <> 1 And j>0
            j=j-1
        Wend
        k = j+(N-1)
        If k>totalPages Then k=totalPages
        If j>1 Then
            l = j-N
            If l<1 Then l=1
            Response.Write (" <a href=""" & thisPageName & "?page=" & l & """ onclick=""return goPage('" & l & "')"">上" & N & "页</a>") 'aa
        End If
        For j = j to k
            If j=currentPage Then
                Response.Write (" [<b>"&j&"</b>]")
            Else
                Response.Write (" <a href=""" & thisPageName & "?page=" & j & """ onclick=""return goPage('" & j & "')""> [" & j & "] </a> ")
            End If
        Next
        If k <> totalPages Then
            m=j
            If m>totalPages Then m=totalPages
            Response.Write (" <a href=""" & thisPageName & "?page=" & m & """ onclick=""return goPage('" & m & "')"">下" & N &"页</a>")
        End If
    End If
    Response.Write ("</td></tr></table>")
End Sub

Function setPageLink(strIn,currentPage,totalPages)
    Dim thisPageName
    thisPageName = currentAspFileFullName()
    Select Case strIn
        Case "首页"
            setPageLink="<a href=""" & thisPageName & "?page=" & 1 & """ onclick=""return goPage('1')"">" & strIn & "</a>"
            If (currentPage=1) Then setPageLink=strIn
        Case "上页"
            setPageLink="<a href=""" & thisPageName & "?page=" & currentPage - 1 & """ onclick=""return goPage('" & currentPage - 1 & "')"">"&strIn&"</a>"
            If (currentPage=1) Then setPageLink=strIn
        Case "下页"
            setPageLink="<a href=""" & thisPageName & "?page=" & currentPage + 1 & """ onclick=""return goPage('" & currentPage + 1 & "')"">"&strIn&"</a>"
            If (currentPage=totalPages) Then setPageLink=strIn
        Case "尾页"
            setPageLink="<a href=""" & thisPageName & "?page=" & totalPages & """ onclick=""return goPage('" & totalPages & "')"">"&strIn&"</a>"
            If (currentPage=totalPages) Then setPageLink=strIn
    end select
    setPageLink=setPageLink&" "
End Function

Sub Javascript(strIn)
    Response.Write("<script language=""javascript"">"&strIn&"</script>")
End Sub

Function TrimLeft(strIn, strTrim)
    While (Left(strIn, Len(strTrim)) = strTrim)
        strIn = Mid(strIn, Len(strTrim) + 1)
    Wend
    TrimLeft = strIn
End Function

Function TrimRight(strIn, strTrim)
    While (Right(strIn, Len(strTrim)) = strTrim)
        strIn = Left(strIn, Len(strIn) - Len(strTrim))
    Wend
    TrimRight = strIn
End Function

Function TrimLeftRight(strIn, strTrim)
    TrimLeftRight = TrimLeft(strIn, strTrim)
    TrimLeftRight = TrimRight(strIn, strTrim)
End Function

Function HtmEncodeStr(strContent)
    If IsNull(strContent) = false Then
        'If CStr(strContent) <> "" Then
            strContent = Server.HTMLEncode(strContent)
            strContent = replace(strContent,chr(13)&chr(10),"<br>")
            strContent = replace(strContent,chr(13),"<br>")
            strContent = replace(strContent,chr(10),"<br>")
            strContent = replace(strContent," ","&nbsp;")
        'End If
    End If
    HtmEncodeStr = strContent
End Function

Function HtmDecodeStr(strContent)
    strContent = Replace(strContent, "&lt;", "<")
    strContent = Replace(strContent, "&gt;", ">")
    strContent = Replace(strContent, "&quot;", """")
    strContent = Replace(strContent, "&nbsp;", " ")
    strContent = Replace(strContent, "&amp;" , "&")
    strContent = Replace(strContent, "'", Chr(39))

    For iHtmDecodeNum = 33 To 384
        strContent = RegExpReplace("&#(0*?)" & iHtmDecodeNum & ";", strContent, Chr(iHtmDecodeNum))
    Next
    HtmDecodeStr = strContent
End Function

Function CheckQuery(strQuery, strCheckMode)
    strQuery = URLDecode(strQuery)
    Select Case strCheckMode
        Case "number"
            CheckQuery = regExpCheck("(^[\d]+$)", strQuery)
        Case "noblank"
            CheckQuery = regExpCheck("(^[^ ]+$)", strQuery)
    End Select
End Function

Function URLDecode(enStr)
    dim deStr
    dim c,iURLDecodeNum,v
    deStr=""

    for iURLDecodeNum = 1 to len(enStr)
        c = Mid(enStr, iURLDecodeNum, 1)
        if c="%" then
            v=eval("&h" + Mid(enStr, iURLDecodeNum + 1, 2))
            if v<128 then
                deStr=deStr&chr(v)
                iURLDecodeNum = iURLDecodeNum + 2
            else
                if IsValidHex(mid(enstr,iURLDecodeNum,3)) then
                    if IsValidHex(mid(enstr,iURLDecodeNum+3,3)) then
                        v=eval("&h"+Mid(enStr,iURLDecodeNum+1,2)+Mid(enStr,iURLDecodeNum+4,2))
                        deStr=deStr&chr(v)
                        iURLDecodeNum=iURLDecodeNum+5
                    else
                        v=eval("&h"+Mid(enStr,iURLDecodeNum+1,2)+cstr(hex(asc(Mid(enStr,iURLDecodeNum+3,1)))))
                        deStr=deStr&chr(v)
                        iURLDecodeNum=iURLDecodeNum+3 
                    end if 
                else 
                    destr=destr&c
                end if
            end if
        else
            if c="+" then
                deStr=deStr&" "
            else
                deStr=deStr&c
            end if
        end if
    next
    URLDecode=deStr
End Function

Function IsValidHex(str)
    IsValidHex=true
    str=ucase(str)
    if len(str) <> 3 then IsValidHex = false:exit function
    if left(str,1) <> "%" then IsValidHex=false:exit function
    c=mid(str,2,1)
    if not (((c >= "0") and (c <= "9")) or ((c >= "A") and (c <= "Z"))) then IsValidHex=false:exit function
    c=mid(str,3,1)
    if not (((c >= "0") and (c <= "9")) or ((c >= "A") and (c <= "Z"))) then IsValidHex=false:exit function
End Function

Function RegExpReplace(patternStr,sourceStr,replaceStr)
    Dim regEx
    Set regEx=New RegExp
    regEx.Pattern=patternStr
    regEx.IgnoreCase=true
    regEx.Global=true 
    regExpReplace=regEx.replace(sourceStr,replaceStr)
End Function

Function RegExpCheck(patternStr,sourceStr)
    Dim regEx
    Set regEx=New RegExp
    regEx.Pattern=patternStr
    regEx.IgnoreCase=true
    regEx.Global=true
    regExpCheck = regEx.Test(sourceStr)
End Function

Function RegExpMatch(patternStr, sourceStr, groupStr)
    Dim regEx
    Set regEx=New RegExp
    regEx.Pattern=patternStr
    regEx.IgnoreCase=true
    regEx.Global=true

    Set regMatches = regEx.Execute(sourceStr)
    Set regMatch = regMatches(0)
    If groupStr = "" Then
        RegExpMatch = regMatch
    Else
        arrMatches = Split(Mid(groupStr, 2), "$")
        For iarrMatchesCount = 0 To Ubound(arrMatches)
            If IsNumeric(arrMatches(iarrMatchesCount)) Then RegExpMatch = RegExpMatch & regMatch.SubMatches(cInt(arrMatches(iarrMatchesCount)) - 1)
        Next
    End If
End Function

Function CurrentAspFileFullName()
    strPath=request.serverVariables("PATH_INFO")
    currentAspFileFullName=lcase(mid(strPath,instrRev(strPath,"/")+1))
End Function

Function CurrentAspFileName()
    strPath=request.serverVariables("PATH_INFO")
    currentAspFileName=lcase(mid(strPath,instrRev(strPath,"/")+1,Len(strPath)-(instrRev(strPath,"/"))-4))
End Function

Function GetIP() 
    Dim strIPAddr
    If Request.ServerVariables("HTTP_X_FORWARDED_FOR") = "" OR InStr(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), "unknown") > 0 Then
        strIPAddr = Request.ServerVariables("REMOTE_ADDR")
        ElseIf InStr(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), ",") > 0 Then
        strIPAddr = Mid(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), 1, InStr(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), ",")-1)
        ElseIf InStr(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), ";") > 0 Then
        strIPAddr = Mid(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), 1, InStr(Request.ServerVariables("HTTP_X_FORWARDED_FOR"), ";")-1)
    Else
        strIPAddr = Request.ServerVariables("HTTP_X_FORWARDED_FOR")
    End If
    getIP = Trim(Mid(strIPAddr, 1, 30))
End Function

Function CheckFolderExists(strFolder)
    Dim strtestfolder,objfso
    Set objfso=createobject("Scripting.filesystemobject")
    checkFolderExists=false
    If objfso.folderexists(strFolder) Then checkFolderExists=true
    Set objfso=nothing
End Function

Function CreateNewFolder(strFolder)
    Dim objfso
    Set objfso=createobject("Scripting.filesystemobject")
    objfso.CreateFolder(strFolder)
    Set objfso=nothing
End Function

Function CheckFileExists(strFile)
    Dim strTestFile,objfso
    Set objfso=createobject("scripting.fileSystemobject")
    checkFileExists=false
    If objfso.fileexists(strFile) Then checkFileExists=true
    Set objfso=nothing
End Function

Function ReadTxtFile(filePath)
    ReadTxtFile=""
    Set objFSO = Server.CreateObject("Scripting.FileSystemObject")
    Set objSourceFile = objFSO.OpenTextFile(filePath,1)
    If Not objSourceFile.AtEndOfStream Then
        ReadTxtFile = objSourceFile.ReadAll
    End If
    objSourceFile.Close
    Set objSourceFile = Nothing
    Set objFSO = Nothing
End Function

Function WriteTxtFile(strName,txtData)
    Set objFSO = Server.CreateObject("Scripting.FileSystemObject")
    Set objCreateFile=objFSO.CreateTextFile(strName,True)
    objCreateFile.Write txtData
    Set objFSO = Nothing
    objCreateFile.Close
    Set objCreateFile = Nothing
End Function

Function DelFile(strName)
    If checkFileExists(strName)=1 Then
        Dim objfso
        Set objfso=createobject("Scripting.filesystemobject")
        objfso.DeleteFile strName, True
        Set objfso=nothing
    End If
End Function

Function CheckPrePage()
    url = request.ServerVariables("HTTP_REFERER")
    url = trim(replace(url,"http://",""))
    url = trim(left(url,len(request.ServerVariables("SERVER_NAME"))))
    If url <> trim(request.ServerVariables("server_name")) Then
        Response.Write("请通过正确的路径访问本网站")
        Response.End()
    End If
End Function

Function GetFolderPath(strIn)
    GetFolderPath = GetFilePath(strIn)
    If GetFolderPath <> "" Then GetFolderPath = Left(GetFolderPath,InstrRev(GetFolderPath, "\", Len(GetFolderPath)))
End Function

Function GetFilePath(strIn)
    GetFilePath = ""
    If Len(strIn) > 0 Then
        GetFilePath = Server.Mappath(strIn)
    Else
        GetFilePath = Request.ServerVariables("path_translated")
    End If
End Function

Function GetIntRnd(lowerbound, upperbound)
    Randomize
    GetIntRnd = Int((upperbound - lowerbound + 1) * Rnd + lowerbound)
End Function

Function NumToStrJZ(iNum, iJZ)
    Dim iModNum
    Dim iModNumStr
    Dim strTurnNum
    Dim strMinus
    Select Case Lcase(iNum)
        Case "date"
            iNum = (Year(Now) & Right("0" & Month(Now), 2) & Right("0" & Day(Now), 2) & Right("000" & GetIntRnd(1, 9999), 2))
        Case "time"
            iNum = (Right("0" & Hour(Now), 2) & Right("0"& Minute(Now), 2) & Right("0" & Second(Now), 2) & Right("000" & GetIntRnd(1, 9999), 2))
        Case "datetime"
            iNum = (Year(Now) & Right("0" & Month(Now), 2) & Right("0" & Day(Now), 2) & Right("0" & Hour(Now), 2) & Right("0"& Minute(Now), 2) & Right("0" & Second(Now), 2) & Right("000" & GetIntRnd(1, 9999), 2))
    End Select

    If IsNumeric(iJZ) = False Then iJZ = 10
    iJZ = CInt(iJZ)
    If iJZ > 36 Then iJZ = 36
    If iJZ < 2 Then iJZ = 2

    strTurnNum = CStr(iNum)
    If iJZ <> 10 Then
        iModNumStr = ""
        strTurnNum = ""
        strMinus = ""
        If (iNum < 0) Then
            iNum = Abs(iNum)
            strMinus = "-"
        End If
        If (iNum = 0) Then 
            strTurnNum = "0"
        Else
            While (iNum > 0)
                iModNum = iNum - Fix(iNum / iJZ) * iJZ
                iNum = Fix(iNum / iJZ)
                iModNumStr = CStr(iModNum)
                If (iModNum > 9) Then
                    iModNumStr = Chr(iModNum - 9 + 96)
                End If
                strTurnNum = iModNumStr + strTurnNum
            Wend
        End If
    End If
    NumToStrJZ = strMinus & strTurnNum
End Function

%>
