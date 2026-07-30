import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { Avatar, Button, Card, Menu, Searchbar, Text } from 'react-native-paper';

import DocumentCard from '../../components/DocumentCard';
import DocumentTabs from '../../components/DocumentTabs';
import EmptyState from '../../components/EmptyState';
import FeedbackMessage from '../../components/FeedbackMessage';
import Screen from '../../components/Screen';
import SelectField from '../../components/SelectField';
import { SORT_OPTIONS, categoryLabel, tabForCategory } from '../../constants/documentCategories';
import { useAuth } from '../../context/AuthContext';
import { listarDocumentosAluno } from '../../services/documentosApi';
import { styles } from '../../theme/styles';
import { getDisplayImageUri } from '../../utils/imageUri';
import { initials } from '../../utils/text';

export default function BibliotecaAlunoScreen({ route, navigation }) {
  const { token } = useAuth();
  const { aluno } = route.params;
  const [documentos, setDocumentos] = useState([]);
  const [tab, setTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [sort, setSort] = useState('recentes');
  const [visibleCount, setVisibleCount] = useState(12);
  const [menuDoc, setMenuDoc] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setDocumentos(await listarDocumentosAluno(aluno.id, token));
    } catch (err) {
      setError(err.message);
    }
  }, [aluno.id, token]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return documentos
      .filter((documento) => tab === 'Todos' || tabForCategory(documento.categoria) === tab)
      .filter((documento) => {
        if (!tipo) return true;
        if (tipo === 'imagem') return documento.tipoArquivo?.startsWith('image/');
        if (tipo === 'pdf') return documento.tipoArquivo?.includes('pdf');
        return !documento.tipoArquivo?.startsWith('image/') && !documento.tipoArquivo?.includes('pdf');
      })
      .filter((documento) => `${documento.titulo} ${documento.descricao} ${categoryLabel(documento.categoria)} ${documento.usuarioUploadNome}`
        .toLowerCase()
        .includes(normalizedSearch))
      .sort((a, b) => {
        if (sort === 'antigos') return new Date(a.dataUpload) - new Date(b.dataUpload);
        if (sort === 'nome') return a.titulo.localeCompare(b.titulo);
        if (sort === 'categoria') return categoryLabel(a.categoria).localeCompare(categoryLabel(b.categoria));
        return new Date(b.dataUpload) - new Date(a.dataUpload);
      });
  }, [documentos, search, sort, tab, tipo]);

  const visibleDocs = filtered.slice(0, visibleCount);
  const foto = getDisplayImageUri(aluno.foto);

  return (
    <View style={styles.flex}>
      <Screen>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.profileHeader}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.profilePhoto} />
              ) : (
                <Avatar.Text size={70} label={initials(aluno.nome)} style={styles.avatarTeal} />
              )}
              <View style={styles.flex}>
                <Text variant="titleLarge" style={styles.title}>{aluno.nome}</Text>
                <Text style={styles.muted}>{aluno.turma || 'Turma não informada'}</Text>
                <Text style={styles.muted}>{documentos.length} documento(s)</Text>
              </View>
            </View>
            <Button mode="contained" icon="file-plus-outline" onPress={() => navigation.navigate('DocumentoForm', { aluno })}>
              Adicionar Documento
            </Button>
          </Card.Content>
        </Card>

        <Searchbar placeholder="Pesquisar documento" value={search} onChangeText={setSearch} style={styles.search} />
        <DocumentTabs value={tab} onChange={(nextTab) => { setTab(nextTab); setVisibleCount(12); }} />

        <View style={styles.filterGrid}>
          <SelectField
            label="Tipo"
            value={tipo}
            options={[
              { value: '', label: 'Todos' },
              { value: 'imagem', label: 'Imagem' },
              { value: 'pdf', label: 'PDF' },
              { value: 'documento', label: 'Documento' },
            ]}
            onChange={setTipo}
          />
          <SelectField label="Ordenar" value={SORT_OPTIONS.find((item) => item.value === sort)?.label} options={SORT_OPTIONS} onChange={setSort} />
        </View>

        <FeedbackMessage type="error" message={error} />
        {visibleDocs.length === 0 ? <EmptyState /> : visibleDocs.map((documento) => (
          <DocumentCard
            key={documento.id}
            documento={documento}
            onPress={() => navigation.navigate('DocumentoDetails', { documentoId: documento.id, aluno })}
            onMenu={() => setMenuDoc(documento)}
          />
        ))}

        {visibleDocs.length < filtered.length && (
          <Button mode="outlined" onPress={() => setVisibleCount((current) => current + 12)}>
            Carregar mais
          </Button>
        )}
      </Screen>

      <Menu
        visible={!!menuDoc}
        onDismiss={() => setMenuDoc(null)}
        anchor={{ x: 280, y: 120 }}
      >
        <Menu.Item
          leadingIcon="eye-outline"
          title="Ver detalhes"
          onPress={() => {
            const selected = menuDoc;
            setMenuDoc(null);
            navigation.navigate('DocumentoDetails', { documentoId: selected.id, aluno });
          }}
        />
        <Menu.Item
          leadingIcon="pencil-outline"
          title="Editar"
          onPress={() => {
            const selected = menuDoc;
            setMenuDoc(null);
            navigation.navigate('DocumentoForm', { aluno, documento: selected });
          }}
        />
      </Menu>
    </View>
  );
}
