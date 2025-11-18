import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, BookOpen, FileText, File, Upload, Bot } from "lucide-react";
import UserManagement from "./admin/UserManagement";
import JurisprudenceManagement from "./admin/JurisprudenceManagement";
import RegulationManagement from "./admin/RegulationManagement";
import SOPManagement from "./admin/SOPManagement";
import ArticleManagement from "./admin/ArticleManagement";
import KnowledgeBaseUpload from "./admin/KnowledgeBaseUpload";
import AIKnowledgeRetriever from "./admin/AIKnowledgeRetriever";

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manajemen Database
          </CardTitle>
          <CardDescription>
            Kelola seluruh konten database dan pengguna sistem
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Pengguna
          </TabsTrigger>
          <TabsTrigger value="jurisprudence" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Yurisprudensi
          </TabsTrigger>
          <TabsTrigger value="regulations" className="gap-2">
            <FileText className="h-4 w-4" />
            Regulasi
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-2">
            <FileText className="h-4 w-4" />
            Pasal
          </TabsTrigger>
          <TabsTrigger value="sop" className="gap-2">
            <File className="h-4 w-4" />
            SOP
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="ai-retriever" className="gap-2">
            <Bot className="h-4 w-4" />
            AI Retriever
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="jurisprudence" className="mt-6">
          <JurisprudenceManagement />
        </TabsContent>

        <TabsContent value="regulations" className="mt-6">
          <RegulationManagement />
        </TabsContent>

        <TabsContent value="articles" className="mt-6">
          <ArticleManagement />
        </TabsContent>

        <TabsContent value="sop" className="mt-6">
          <SOPManagement />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <KnowledgeBaseUpload />
        </TabsContent>

        <TabsContent value="ai-retriever" className="mt-6">
          <AIKnowledgeRetriever />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
