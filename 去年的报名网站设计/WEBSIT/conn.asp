<%
'' ============================================================================================
'' 项目名称：查询班级报名情况
'' 项目版本：V1.0
'' 项目描述：按班级查询报名情况
'' 文件名称：{file_add_name}
'' 文件描述：数据库连接、关闭文件
'' 公司名称：教务处
'' 开发人员：李大侠
'' 创建日期：2010-12-4 16:44:24
'' 修订日期：2010-12-04 04:53:52
'' 版权信息：Copyright (C) 2010

'' 项目升级时需读取以下生成工具的版权信息
'' 生成工具：风越程序代码生成器 [FireCode Creator]
'' 当前版本：完全版 V1.0
'' 官方网站：http://www.sino8848.com
'' ============================================================================================

Dim conn, connStr, db, starTime, endTime, costTime
starTime = timer()

on error resume next
connstr="DBQ="+server.mappath("data/fdasfasdNIH435346767123.mdb")+";DefaultDir=;DRIVER={Microsoft Access Driver (*.mdb)};"
Set conn=Server.CreateObject("ADODB.CONNECTION")
conn.open connstr

If IsObject(conn) Then
    If conn.Errors.Count > 0 Then
        For iErrorCount = 0 To conn.Errors.Count - 1
            If conn.Errors(iErrorCount).Number > 0 Then
                Response.Write ("错误编号 (Error No): "& conn.Errors(iErrorCount).Number &"<br>")
                Response.Write ("错误信息 (Description): "& conn.Errors(iErrorCount).Description  &"<br>")
                Response.Write ("出错文件 (Source): "& conn.Errors(iErrorCount).Source  &"<br>")
                Response.Write ("SQL 状态 (SQLState): "& conn.Errors(iErrorCount).SQLState  &"<br>")
                Response.Write ("本地错误 (NativeError): "& conn.Errors(iErrorCount).NativeError  &"<br>")
            End If
        Next
    End If
End If

Function connClose()
    If conn.State = 1 Then conn.Close()
    If IsObject(conn) Then Set conn = Nothing

    endTime = timer()
    costTime = formatNumber((endTime - startTime) / 1000, 2)
    Response.Write ("共用" & costTime & "毫秒")
End Function
%>
