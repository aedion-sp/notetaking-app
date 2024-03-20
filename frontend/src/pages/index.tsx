import React, { useState, useEffect } from "react";
import axios from "axios";

import { Card, CardDescription, CardTitle, CardHeader } from "@/components/ui/card";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Content } from "@radix-ui/react-context-menu";

interface Note {
  id: number;
  title?: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });
  const [updateNote, setUpdateNote] = useState({
    id: 0,
    title: '',
    content: '',
    status: ''
  });

  // fetch all notes
  useEffect(() => {
    axios.get(`${apiUrl}/notes`)
      .then((response) => {
        setNotes(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  // add new todo note
  const createNewTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newNote.title) {
      try {
        const response = await axios.post(`${apiUrl}/notes`, {
          title: newNote.title,
          content: newNote.content,
          status: 'todo'
        })
        setNotes([...notes, response.data]);
        setNewNote({
          title: '',
          content: ''
        });

      } catch (error) {
        console.error('Error creating new note: ', error);
      }
    }
  }

  // delete note
  const deleteNote = (id: number) => async () => {
    try {
      await axios.delete(`${apiUrl}/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note: ', error);
    }
  }

  // update note
  const updateSelectedNote = async (note: Note) => {
    try {
      const response = await axios.put(`${apiUrl}/notes/${note.id}`, {
        title: updateNote.title || note.title,
        content: updateNote.content || note.content,
        status: updateNote.status || note.status
      });
      setNotes(notes.map(mappedNote => mappedNote.id === note.id ? response.data : mappedNote));
      setUpdateNote({
        id: 0,
        title: '',
        content: '',
        status: ''
      });
    } catch (error) {
      console.error('Error updating note: ', error);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold m-4 text-center">My Notes App</h1>

      {/* Add new note */}
      <div className="bg-green-100 m-2 rounded shadow max-w-screen-md mx-auto">
        <h2 className="text-xl font-bold p-2">Add New Note</h2>
        <form className="flex justify-center" onSubmit={createNewTodo}>
          <div className="w-screen mx-2">
            <input type="text" placeholder="Title"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 m-2"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />

            <input type="text" placeholder="Content (optional)"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 m-2"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} />
          </div>

          <button type="submit"
            className="m-2 w-2/12 bg-green-700 text-white py-1 px-4 border-2 border-green-600 rounded hover:bg-green-600">
            Add
          </button>
        </form>

      </div>

      {/* Show all notes */}
      <p className="text-gray-700 text-sm mt-4 text-center">Right click on the card to edit or delete the note</p>
      <div className="p-2 grid grid-cols-3 gap-4 bg-yellow-50 rounded-lg m-2 shadow max-w-screen-md mx-auto">
        {/* Column 1: to do notes */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center text-red-700">To Do</h2>
          {notes.filter(note => note.status === 'todo')
            .map((note) => (
              <ContextMenu key={note.id}>
                <ContextMenuTrigger>
                  <Card className="bg-red-100 mb-4">
                    <CardHeader>
                      <CardTitle>{note.title}</CardTitle>
                      <CardDescription>
                        {note.content}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className="text-red-500 focus:text-red-700 focus:bg-red-100" onClick={deleteNote(note.id)}>
                    Delete
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  {/* context menu item for editing title, content and status of the note */}
                  <ContextMenuLabel>
                    Edit Note
                    <form onSubmit={
                      () => {
                        updateSelectedNote(note);
                      }

                    }>
                      <input type="text" placeholder={note.title}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={updateNote.title}
                        onChange={(e) => setUpdateNote({ ...updateNote, title: e.target.value })} />

                      <input type="text" placeholder={note.content || 'Content'}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={updateNote.content}
                        onChange={(e) => setUpdateNote({ ...updateNote, content: e.target.value })} />

                      <label className="m-2">Status: </label>
                      <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={note.status}
                        onChange={(e) => setUpdateNote({ ...updateNote, status: e.target.value })}>
                        <option value="todo">To Do</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>

                      <button type="submit"
                        className="m-2 bg-green-700 text-white py-1 px-4 border-2 border-green-600 rounded hover:bg-green-600">
                        Update
                      </button>

                    </form>

                  </ContextMenuLabel>
                </ContextMenuContent>
              </ContextMenu>
            ))}
        </div>

        {/* Column 2: doing notes */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center text-yellow-700">Doing</h2>
          {notes.filter(note => note.status === 'doing')
            .map((note) => (
              <ContextMenu key={note.id}>
                <ContextMenuTrigger>
                  <Card className="bg-yellow-100 mb-4">
                    <CardHeader>
                      <CardTitle>{note.title}</CardTitle>
                      <CardDescription>
                        {note.content}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className="text-red-500 focus:text-red-700 focus:bg-red-100" onClick={deleteNote(note.id)}>
                    Delete
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  {/* context menu item for editing title, content and status of the note */}
                  <ContextMenuLabel>
                    Edit Note
                    <form onSubmit={
                      () => {
                        updateSelectedNote(note);
                      }

                    }>
                      <input type="text" placeholder={note.title}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={updateNote.title}
                        onChange={(e) => setUpdateNote({ ...updateNote, title: e.target.value })} />

                      <input type="text" placeholder={note.content || 'Content'}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={updateNote.content}
                        onChange={(e) => setUpdateNote({ ...updateNote, content: e.target.value })} />

                      <label className="m-2">Status: </label>
                      <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={note.status}
                        onChange={(e) => setUpdateNote({ ...updateNote, status: e.target.value })}>
                        <option value="todo">To Do</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>

                      <button type="submit"
                        className="m-2 bg-green-700 text-white py-1 px-4 border-2 border-green-600 rounded hover:bg-green-600">
                        Update
                      </button>

                    </form>

                  </ContextMenuLabel>
                </ContextMenuContent>
              </ContextMenu>
            ))}
        </div>

        {/* Column 3: done notes */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center text-green-700">Done</h2>
          {notes.filter(note => note.status === 'done')
            .map((note) => (
              <ContextMenu key={note.id}>
                <ContextMenuTrigger>
                  <Card className="bg-green-100 mb-4">
                    <CardHeader>
                      <CardTitle>{note.title}</CardTitle>
                      <CardDescription>
                        {note.content}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className="text-red-500 focus:text-red-700 focus:bg-red-100" onClick={deleteNote(note.id)}>
                    Delete
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  {/* context menu item for editing title, content and status of the note */}
                  <ContextMenuLabel>
                    Edit Note
                    <form onSubmit={
                      () => {
                        updateSelectedNote(note);
                      }

                    }>
                      <input type="text" placeholder={note.title}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={updateNote.title}
                        onChange={(e) => setUpdateNote({ ...updateNote, title: e.target.value })} />

                      <input type="text" placeholder={note.content || 'Content'}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={updateNote.content}
                        onChange={(e) => setUpdateNote({ ...updateNote, content: e.target.value })} />

                      <label className="m-2">Status: </label>
                      <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors m-2"
                        value={note.status}
                        onChange={(e) => setUpdateNote({ ...updateNote, status: e.target.value })}>
                        <option value="todo">To Do</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>

                      <button type="submit"
                        className="m-2 bg-green-700 text-white py-1 px-4 border-2 border-green-600 rounded hover:bg-green-600">
                        Update
                      </button>

                    </form>

                  </ContextMenuLabel>
                </ContextMenuContent>
              </ContextMenu>
            ))}
        </div>
      </div>
    </div>
  )

}