<%
'' ============================================================================================
'' ��Ŀ���ƣ���ѯ�༶�������
'' ��Ŀ�汾��V1.0
'' ��Ŀ���������༶��ѯ�������
'' �ļ����ƣ�{file_add_name}
'' �ļ����������ݿ����ӡ��ر��ļ�
'' ��˾���ƣ�����
'' ������Ա�������
'' �������ڣ�2010-12-4 16:44:24
'' �޶����ڣ�2010-12-04 04:53:52
'' ��Ȩ��Ϣ��Copyright (C) 2010

'' ��Ŀ����ʱ���ȡ�������ɹ��ߵİ�Ȩ��Ϣ
'' ���ɹ��ߣ���Խ������������� [FireCode Creator]
'' ��ǰ�汾����ȫ�� V1.0
'' �ٷ���վ��http://www.sino8848.com
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
                Response.Write ("������ (Error No): "& conn.Errors(iErrorCount).Number &"<br>")
                Response.Write ("������Ϣ (Description): "& conn.Errors(iErrorCount).Description  &"<br>")
                Response.Write ("�����ļ� (Source): "& conn.Errors(iErrorCount).Source  &"<br>")
                Response.Write ("SQL ״̬ (SQLState): "& conn.Errors(iErrorCount).SQLState  &"<br>")
                Response.Write ("���ش��� (NativeError): "& conn.Errors(iErrorCount).NativeError  &"<br>")
            End If
        Next
    End If
End If

Function connClose()
    If conn.State = 1 Then conn.Close()
    If IsObject(conn) Then Set conn = Nothing

    endTime = timer()
    costTime = formatNumber((endTime - startTime) / 1000, 2)
    Response.Write ("����" & costTime & "����")
End Function
%>
